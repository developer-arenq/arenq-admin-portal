// utils/sendReviewMailLogic.js
import nodemailer from "nodemailer";
import Order from "../model/orderSchema";

export async function sendReviewMailLogic(orderId) {
  const order = await Order.findOne({
    _id: orderId,
    isDelevered: true,
    reviewEmailSent: false,
    reviewEligibleAt: { $lte: new Date() },
  }).populate("shipping_address");

  if (!order) {
    return { skipped: true, reason: "Order not eligible" };
  }

  // 🔒 Atomic update
  order.reviewEmailSent = true;
  order.reviewEmailSentAt = new Date();
  await order.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_SECRET,
    },
  });

  // ✅ PRODUCT LIST (Premium Table Design)
  const itemsHTML = order.order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:20px 15px;border-bottom:1px solid #e5e7eb;background:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="80" valign="top">
                <img src="${item.image[0]}" width="70" height="70"
                  style="border-radius:10px;object-fit:cover;display:block;" />
              </td>
              <td style="padding-left:15px;vertical-align:top;">
                <div style="font-size:16px;font-weight:600;color:#111;">
                  ${item.title}
                </div>
                <div style="font-size:14px;color:#555;margin-top:6px;">
                  ${item.quantity} × ₹${item.price}
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin-top:15px;">
            <a href="${process.env.NEXTAUTH_URL}/products/${item.slug}?review=true&orderId=${order._id}&productId=${item.id}"
              style="display:inline-block;background:#15803d;color:#ffffff;
              padding:12px 32px;border-radius:30px;text-decoration:none;
              font-size:15px;font-weight:600;letter-spacing:0.3px;">
              ⭐ Write a Review
            </a>
          </div>
        </td>
      </tr>
    `
    )
    .join("");

  // ✅ FULL EMAIL TEMPLATE (OLD DESIGN – IMPROVED)
  const html = `
  <div style="background:#f0fdf4;padding:30px;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:18px;
      overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.08);
      border:1px solid #e2e8f0;">

      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#15803d,#16a34a);
        color:#fff;padding:30px;text-align:center;">
        <h1 style="margin:0;font-size:26px;font-weight:700;">
          We’d Love Your Feedback 💚
        </h1>
        <p style="margin:8px 0 0;font-size:15px;color:#dcfce7;">
          Tell us what you think about your recent order
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">
        <p style="font-size:16px;color:#1f2937;margin:0 0 10px;">
          Hi <strong>${order.shipping_address?.fullname || "Customer"}</strong>,
        </p>

        <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
          Thank you for shopping with <strong>Arenq</strong>!  
          Your order <b>#${order._id}</b> has been delivered.  
          We’d love to hear your thoughts on the products below.
        </p>

        <!-- PRODUCT TABLE -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="border-collapse:collapse;background:#f9fafb;
          border-radius:12px;overflow:hidden;">
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <p style="margin-top:40px;font-size:14px;color:#4b5563;
          text-align:center;line-height:1.7;">
          Your feedback helps us improve and helps other customers choose better 💫  
          It only takes a minute.
        </p>
      </div>

      <!-- FOOTER -->
      <div style="background:#f9fafb;color:#6b7280;text-align:center;
        padding:18px;font-size:12px;">
        © ${new Date().getFullYear()} <strong>Arenq</strong> · All rights reserved<br/>
        <a href="${process.env.NEXTAUTH_URL}"
          style="color:#15803d;text-decoration:none;font-weight:500;">
          Visit our store
        </a>
      </div>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Arenq" <${process.env.MAIL}>`,
    to: order.shipping_address.email,
    subject: "🌟 We’d Love Your Feedback – Share Your Experience!",
    html,
  });

  return { sent: true, orderId };
}
