import main from "../../../../database/conn";
import Order from "../../../../model/orderSchema";
import { shiprocketLogin } from "../../../../lib/shiprocket";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await main();
    const { orderId } = req.query;

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.shiprocket_awb) {
      return res.status(200).json({
        status: null,
        message: "AWB not generated yet",
      });
    }

    const token = await shiprocketLogin();

    const srRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.shiprocket_awb}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const srData = await srRes.json();
    const td = srData?.tracking_data;

    const shipment = td?.shipment_track?.[0];

    const statusMap = {
      1: "order_confirmed",
      6: "order_confirmed",
      7: "shipped",
      8: "out_for_delivery",
      9: "delivered",
    };

    const mappedStatus = statusMap[td?.shipment_status] || "order_confirmed";

    // ✅ Activities (safe)
    const activities = Array.isArray(td?.shipment_track_activities)
      ? td.shipment_track_activities
      : [];

    // ✅ Fallback current location
    const currentLocation =
      activities.at(-1)?.location ||
      shipment?.current_status ||
      "Shipment not yet picked up";

    // ✅ Fallback last updated
    const lastUpdated =
      activities.at(-1)?.date ||
      shipment?.updated_time_stamp ||
      null;

    return res.status(200).json({
      status: mappedStatus,
      courier: shipment?.courier_name || order.shiprocket_courier,
      awb: order.shiprocket_awb,
      current_location: currentLocation,
      last_updated: lastUpdated,
      tracking: activities.map((a) => ({
        status: a.status,
        location: a.location,
        date: a.date,
      })),
      track_url: td?.track_url,
      eta: td?.etd,
    });
  } catch (err) {
    console.error("ORDER TRACKING ERROR:", err);
    return res.status(500).json({ error: "Tracking failed" });
  }
}
