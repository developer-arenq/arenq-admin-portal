import dbConnect from "../../../database/conn";

import Cart from "../../../model/Cart";
import User from "../../../model/userSchema";

import sendCartMail from "../../../utils/sendCartMail";

export default async function handler(
  req,
  res
) {
  await dbConnect();

  try {
    // 1 HOUR OLD CARTS

    const oneHourAgo = new Date(
      Date.now() - 60 * 60 * 1000
    );

    const carts = await Cart.find({
      updatedAt: {
        $lte: oneHourAgo,
      },

      email_sent: false,
    });

    for (const cart of carts) {
      const user = await User.findById(
        cart.user_id
      );

      if (!user?.email) continue;

      // SEND MAIL

      await sendCartMail(user, cart);

      // UPDATE CART

      cart.email_sent = true;

      cart.reminder_count += 1;

      await cart.save();
    }

    return res.status(200).json({
      success: true,

      carts: carts.length,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
    });
  }
}