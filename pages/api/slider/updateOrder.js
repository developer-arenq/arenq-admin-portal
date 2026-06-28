import main from "../../../database/conn";
import Slider from "../../../model/sliderSchema";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await main();
    const { id, order } = req.body;

    if (!id || order === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the current slider
    const currentSlider = await Slider.findById(id);
    if (!currentSlider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    const sliderType = currentSlider.sliderType; // ⭐ Get current slider type

    // Check if another slider with same type has same order
    const existing = await Slider.findOne({ 
      order: Number(order),
      sliderType // ⭐ Only same type sliders
    });

    // If another exists, swap orders
    if (existing && existing._id.toString() !== id) {
      await Slider.findByIdAndUpdate(existing._id, {
        order: currentSlider.order,
      });
    }

    // Update current slider with new order
    const updated = await Slider.findByIdAndUpdate(
      id,
      { order: Number(order), updatedAt: new Date() },
      { new: true }
    );

    return res.status(200).json({
      message: "Order updated successfully within same type",
      slider: updated,
    });
  } catch (error) {
    console.error("Update Order Error:", error);
    return res.status(500).json({ error: "Failed to update order" });
  }
}
