import main from "../../../database/conn";
import Order from "../../../model/orderSchema";

export default async function handler(req, res) {
  try {
    await main();

    const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - FIFTEEN_DAYS);

    const result = await Order.updateMany(
      {
        createdAt: { $lte: cutoffDate },
        $or: [
          { isPaid: { $ne: true } },
          { isDelevered: { $ne: true } },
          { isDelivered: { $ne: true } },
        ],
      },
      {
        $set: {
          isPaid: true,
          isDelevered: true,   // 🔥 तुमचा जुना field
          isDelivered: true,   // 🔥 future-safe (optional but recommended)
          deliveredAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      modifiedOrders: result.modifiedCount,
    });
  } catch (error) {
    console.error("Auto complete error:", error);
    return res.status(500).json({ error: error.message });
  }
}
