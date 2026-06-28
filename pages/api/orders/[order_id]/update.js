import main from "../../../../database/conn";

import Order from "../../../../model/orderSchema";

import jwt from "jsonwebtoken";

const update = async (req, res) => {

  try {

    await main();

    const token =
      req.headers.authorization.split(" ")[1];

    const token_data =
      jwt.verify(
        token,
        process.env.JWT_KEY
      );

    const { order_id } = req.query;

    const {
      order_item_id,
      delivery_status,
    } = req.body;

    if (!token_data.isAdmin) {

      return res.status(401).json({
        error: "Access Denied",
      });
    }

    // ✅ Update item delivery status
    if (order_item_id) {

      await Order.findOneAndUpdate(
        {
          _id: order_id,

          "order_items._id":
            order_item_id,
        },
        {
          $set: {
            "order_items.$.delivery_status":
              delivery_status,
          },
        },
        { new: true }
      );

    } else {

      // ✅ Update full order
      await Order.updateOne(
        { _id: order_id },
        req.body
      );
    }

    // ✅ Get updated order
    const updatedOrder =
      await Order.findById(order_id);

    // ✅ AUTO SEND REVIEW MAIL
    if (
      updatedOrder?.isDelivered &&
      !updatedOrder?.reviewEmailSent
    ) {

      try {

        await fetch(
          `${process.env.NEXTAUTH_URL}/api/review/sendReviewMail`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              orderId:
                updatedOrder._id,
            }),
          }
        );

        console.log(
          "✅ Review mail triggered"
        );

      } catch (mailErr) {

        console.error(
          "❌ Review mail trigger failed:",
          mailErr
        );
      }
    }

    res.status(200).json({
      message:
        "Order updated successfully",

      updatedData: updatedOrder,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export default update;