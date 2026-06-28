// pages/api/admin/send-abandoned-mails.js

import dbConnect from "../../../database/conn";
import Cart from "../../../model/Cart";
import User from "../../../model/userSchema";
import transporter from "../../../lib/mailer";

export default async function handler(req, res) {
    await dbConnect();

    try {

        const { cartId } = req.query;

        let carts;

        if (cartId) {
            const cart = await Cart.findById(cartId).lean();

            console.log("FOUND CART:", cart);

            carts = cart ? [cart] : [];
        } else {
            carts = await Cart.find({
                items: { $exists: true, $ne: [] },
                reminder_count: { $lt: 3 }
            }).lean();
        }

        console.log("CART ID FROM QUERY:", cartId);
        console.log("FOUND CARTS:", carts.length);
        let sentCount = 0;



        for (const cart of carts.slice(0, 20)) {

            console.log("CART ID:", cart._id);

            let userEmail = "";
            let userName = "Customer";

            if (cart.user_id) {
                try {
                    const user = await User.findById(cart.user_id).lean();
                    if (user?.email) {
                        userEmail = user.email;
                        userName = user.fullname || "Customer";
                    }
                } catch (err) {
                    console.log("INVALID USER ID");
                }
            }

            if (!userEmail) {
                userEmail = cart.customer_email || "";
                userName = cart.customer_name || "Customer";
            }

            if (!userEmail) {
                console.log("NO EMAIL FOUND");
                continue;
            }

            // ======================
            // CALCULATIONS
            // ======================

            const sellingTotal = cart.items?.reduce(
                (acc, item) => acc + item.price * item.quantity, 0
            ) || 0;

            const gst = cart.items?.reduce(
                (acc, item) => acc + (item.taxAmount || 0), 0
            ) || 0;

            const paymentMethod = cart.payment_method || "online";
            const shipping = paymentMethod === "cod" ? 100 : 70;
            const orderTotal = sellingTotal + shipping + gst;

            // ======================
            // COUPON LOGIC
            // ======================

            let coupon = null;
            let discountAmount = 0;

            if (orderTotal >= 500) {
                coupon = { code: "SAVE50" };
                discountAmount = 50;
            } else if (orderTotal >= 300) {
                coupon = { code: "SAVE30" };
                discountAmount = 30;
            }

            const payableAmount = orderTotal - discountAmount;

            // ======================
            // EMAIL HTML
            // ======================

            const itemsHTML = cart.items?.map((item) => `
                <tr>
                    <td style="padding: 0 0 20px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fafaf8; border-radius: 16px; overflow: hidden;">
                            <tr>
                                <td style="padding: 16px; width: 100px; vertical-align: top;">
                                    <img src="${item.thumbnail}" width="90" height="90"
                                        style="border-radius: 12px; object-fit: cover; display: block; border: 1px solid #ece9e0;" />
                                </td>
                                <td style="padding: 16px 16px 16px 0; vertical-align: top;">
                                    <p style="margin: 0 0 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">${item.title}</p>
                                    <p style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 12px; color: #888; letter-spacing: 0.5px; text-transform: uppercase;">${item.variantValue || "Standard"} &nbsp;•&nbsp; Qty: ${item.quantity}</p>
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="padding-right: 10px;">
                                                <span style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #2d5016;">₹${item.price * item.quantity}</span>
                                            </td>
                                            <td>
                                                <span style="font-family: Arial, sans-serif; font-size: 13px; color: #aaa; text-decoration: line-through;">₹${item.MRP * item.quantity}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `).join("") || "";

            const couponRowHTML = coupon ? `
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="font-family: Arial, sans-serif; font-size: 13px; color: #a3c47a;">
                                    🎁 Coupon Applied
                                    <span style="background: rgba(163,196,122,0.15); border: 1px solid rgba(163,196,122,0.3); border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-left: 8px;">${coupon.code}</span>
                                </td>
                                <td align="right" style="font-family: Georgia, serif; font-size: 15px; font-weight: 700; color: #a3c47a;">−₹${discountAmount}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            ` : "";

            const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Cart is Waiting | Arenq</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0ede4; font-family: Arial, sans-serif;">

    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0ede4; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">

                    <!-- ═══ LOGO BAR ═══ -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #7a6f5a;">
                                        ✦ &nbsp; Arenq &nbsp; ✦
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 6px;">
                                        <div style="height: 1px; background: linear-gradient(to right, transparent, #c4b89a, transparent); width: 200px;"></div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ═══ HERO CARD ═══ -->
                    <tr>
                        <td style="background: #1c2b13; border-radius: 24px 24px 0 0; padding: 48px 40px 40px; text-align: center;">
                            <p style="margin: 0 0 16px 0; font-family: Arial, sans-serif; font-size: 36px; line-height: 1;">🛒</p>
                            <h1 style="margin: 0 0 12px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 34px; font-weight: 400; color: #f5f0e8; letter-spacing: -0.5px; line-height: 1.2;">
                                Your Cart is Waiting
                            </h1>
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; color: #8fac6a; letter-spacing: 1px; text-transform: uppercase;">
                                Himalayan Goodness · Handpicked for You
                            </p>
                        </td>
                    </tr>

                    <!-- ═══ GREETING ═══ -->
                    <tr>
                        <td style="background: #ffffff; padding: 32px 40px 12px;">
                            <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 22px; color: #1a1a1a;">
                                Hello, ${userName} 👋
                            </p>
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; color: #666; line-height: 1.7;">
                                You left something behind. Your handpicked Himalayan products are still waiting in your cart — but stock is limited. Complete your order before they're gone.
                            </p>
                            <div style="height: 1px; background: #ece9e0; margin-top: 28px;"></div>
                        </td>
                    </tr>

                    <!-- ═══ CART ITEMS ═══ -->
                    <tr>
                        <td style="background: #ffffff; padding: 24px 40px 8px;">
                            <p style="margin: 0 0 16px 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Your Items</p>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                ${itemsHTML}
                            </table>
                        </td>
                    </tr>

                    <!-- ═══ ORDER SUMMARY ═══ -->
                    <tr>
                        <td style="background: #ffffff; padding: 0 40px 32px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #1c2b13; border-radius: 20px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 28px 28px 0;">
                                        <p style="margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #6a8a45;">Order Summary</p>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                                            <!-- Product Total -->
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-family: Arial, sans-serif; font-size: 13px; color: #8fac6a;">Product Total</td>
                                                            <td align="right" style="font-family: Georgia, serif; font-size: 15px; color: #f5f0e8;">₹${sellingTotal}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Shipping -->
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-family: Arial, sans-serif; font-size: 13px; color: #8fac6a;">Shipping</td>
                                                            <td align="right" style="font-family: Georgia, serif; font-size: 15px; color: #f5f0e8;">₹${shipping}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Coupon (conditional) -->
                                            ${couponRowHTML}

                                        </table>
                                    </td>
                                </tr>

                                <!-- Total Amount -->
                                <tr>
                                    <td style="padding: 20px 28px 28px;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 1px solid rgba(255,255,255,0.12); padding-top: 20px;">
                                            <tr>
                                                <td style="padding-top: 18px;">
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-family: Georgia, serif; font-size: 16px; color: #f5f0e8; font-weight: 400;">Total Payable</td>
                                                            <td align="right" style="font-family: Georgia, serif; font-size: 32px; font-weight: 700; color: #ffffff;">₹${payableAmount}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <!-- ═══ COUPON BANNER (if applicable) ═══ -->
                    ${coupon ? `
                    <tr>
                        <td style="background: #ffffff; padding: 0 40px 24px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                style="background: #f5f9ee; border: 1px dashed #a3c47a; border-radius: 14px; padding: 18px 20px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 4px 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #6a8a45;">Exclusive Offer For You</p>
                                        <p style="margin: 0; font-family: Georgia, serif; font-size: 15px; color: #1a1a1a;">Use code <strong style="letter-spacing: 1px; color: #2d5016;">${coupon.code}</strong> and save <strong>₹${discountAmount}</strong> on your order!</p>
                                    </td>
                                    <td align="right" style="white-space: nowrap; padding-left: 16px;">
                                        <span style="font-family: Arial, sans-serif; font-size: 22px;">🎁</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ` : ""}

                    <!-- ═══ CTA BUTTON ═══ -->
                    <tr>
                        <td style="background: #ffffff; padding: 0 40px 40px; text-align: center;">
                            <a href="https://www.arenq.co.in/cart"
                                style="display: inline-block; background: #1c2b13; color: #f5f0e8; text-decoration: none;
                                font-family: Georgia, serif; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;
                                padding: 18px 48px; border-radius: 14px;">
                                Complete My Order &nbsp;→
                            </a>
                            <p style="margin: 16px 0 0; font-family: Arial, sans-serif; font-size: 12px; color: #aaa;">
                                Free delivery on orders above ₹999 &nbsp;·&nbsp; 2-day returns
                            </p>
                        </td>
                    </tr>

                    <!-- ═══ FOOTER ═══ -->
                    <tr>
                        <td style="background: #1c2b13; border-radius: 0 0 24px 24px; padding: 28px 40px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 14px; color: #8fac6a; letter-spacing: 1px;">Arenq</p>
                            <p style="margin: 0 0 16px 0; font-family: Arial, sans-serif; font-size: 12px; color: #5a6e48; line-height: 1.6;">
                                Authentic Himalayan Products · Dharamshala, HP<br/>
                                <a href="https://www.arenq.co.in" style="color: #6a8a45; text-decoration: none;">www.arenq.co.in</a>
                            </p>
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; color: #3d4f2e;">
                                You are receiving this email because you added items to your cart.<br/>
                                <a href="https://www.arenq.co.in/unsubscribe" style="color: #5a6e48; text-decoration: underline;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>

                    <!-- ═══ BOTTOM SPACING ═══ -->
                    <tr>
                        <td style="padding-top: 24px; text-align: center;">
                            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; color: #a89e8a; text-transform: uppercase;">
                                ✦ &nbsp; Arenq &nbsp; ✦
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
            `;

            // ======================
            // SEND MAIL
            // ======================

            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: userEmail,
                    subject: "🛒 Your Cart is Waiting | Arenq",
                    html: emailHTML,
                });

                console.log("EMAIL SENT:", userEmail);

                await Cart.findByIdAndUpdate(cart._id, {
                    $inc: { reminder_count: 1 },
                    email_sent: true,
                });

                sentCount++;

                await new Promise((resolve) => setTimeout(resolve, 2000));

            } catch (mailErr) {
                console.log("MAIL ERROR:", mailErr);
            }
        }

        return res.status(200).json({
            success: true,
            total_carts: carts.length,
            emails_sent: sentCount,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to send reminders",
        });
    }
}