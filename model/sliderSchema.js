import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    link: { type: String, default: "/shop" },
    order: { type: Number, default: 1 },
    sliderType: { type: String, enum: ["desktop", "mobile"], required: true }, // 🔥
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Slider || mongoose.model("Slider", sliderSchema);
