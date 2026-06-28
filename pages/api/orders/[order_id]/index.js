import main from "../../../../database/conn";
import Order from "../../../../model/orderSchema";
// import { useParams } from "react-router-dom";

const getOrder = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { order_id } = req.query;
    const order = await Order.findById({ _id: order_id })
      .populate("shipping_address")
      .populate({ path: "user_id", select: "fullname email mobile" })
      .populate("coupon")
      .populate("transaction_id");
    if (order) {
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const itemDelivered = order.order_items?.every(
        (item) => item.delivery_status === "delivered"
      );

      order.isDelivered =
        order.isDelivered ||
        order.isDelevered ||
        itemDelivered ||
        orderAge > 15 * 24 * 60 * 60 * 1000;

      res.status(200).json(order);
    } else {
      res.status(400).json({ mesage: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getOrder;
