import main from "../../../database/conn";
import Order from "../../../model/orderSchema";

export default async function getOrders(req, res) {
  try {
    // ✅ Ensure DB connected
    await main();

    // ✅ Fetch all orders (latest first)
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean(); // performance improvement

    const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

    const enrichedOrders = orders.map((order) => {
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const itemDelivered = order.order_items?.every(
        (item) => item.delivery_status === "delivered"
      );

      return {
        ...order,
        isDelivered:
          order.isDelivered ||
          order.isDelevered ||
          itemDelivered ||
          orderAge > FIFTEEN_DAYS,
      };
    });

    return res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error("❌ Orders fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}
