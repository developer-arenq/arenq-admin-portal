import main from "../../../database/conn";
import Slider from "../../../model/sliderSchema";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await main();
    const updates = req.body; // [{ id, order }]
    for (const { id, order } of updates) {
      await Slider.findByIdAndUpdate(id, { order });
    }
    return res.status(200).json({ message: "Order updated" });
  } catch (error) {
    console.error("Reorder error:", error);
    return res.status(500).json({ error: "Failed to reorder sliders" });
  }
}
