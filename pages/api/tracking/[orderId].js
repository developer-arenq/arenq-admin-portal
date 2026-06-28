import main from "../../../database/conn";
import Order from "../../../model/orderSchema";
import { shiprocketLogin } from "../../../lib/shiprocket";

export default async function handler(req, res) {
  await main();
  const { orderId } = req.query;

  const order = await Order.findById(orderId);
  if (!order?.shiprocket_awb) {
    return res.json({ status: "order_confirmed" });
  }

  const token = await shiprocketLogin();

  const srRes = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.shiprocket_awb}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await srRes.json();

  return res.json({
    status: data?.tracking_data?.shipment_status_current,
    history: data?.tracking_data?.shipment_track || [],
  });
}
