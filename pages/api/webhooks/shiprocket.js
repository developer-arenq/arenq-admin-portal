import main from "../../../database/conn";
import Order from "../../../model/orderSchema";
import { sendReviewMailLogic } from "../../../utils/sendReviewMailLogic";

const statusMap = {
  "ORDER CONFIRMED": "order_confirmed",
  "SHIPPED": "shipped",
  "OUT FOR DELIVERY": "out_for_delivery",
  "DELIVERED": "delivered",
  "RTO INITIATED": "rto",
  "RTO DELIVERED": "rto_delivered",
};

export default async function handler(req, res) {
  await main();

  try {
    const { awb, current_status } = req.body;
    if (!awb || !current_status) return res.status(200).end();

    const mappedStatus = statusMap[current_status];
    if (!mappedStatus) return res.status(200).end();

    const order = await Order.findOne({ shiprocket_awb: awb });
    if (!order) return res.status(200).end();

    // 🔄 Update order status
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        "order_items.$[].delivery_status": mappedStatus,
        isDelevered: mappedStatus === "delivered",
        isDelivered: mappedStatus === "delivered",
        deliveredAt: mappedStatus === "delivered" ? new Date() : null,
      },
    });

    // ⭐ SEND REVIEW EMAIL (ONLY ON DELIVERY)
    if (mappedStatus === "delivered") {
      await sendReviewMailLogic(order._id);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Shiprocket webhook error:", err);
    return res.status(500).end();
  }
}
