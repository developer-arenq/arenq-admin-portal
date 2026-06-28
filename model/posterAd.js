import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    owner: { type: String },
    email: { type: String },
    imageUrl: { type: String, required: true },
    subject: { type: String, required: true },
    heading: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Ad || mongoose.model("posterAd", adSchema);
