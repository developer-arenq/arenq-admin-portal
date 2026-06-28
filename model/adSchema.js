import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    owner: { type: String },
    email: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    MRP: { type: Number, required: true },
    alt_text: { type: String, required: true },
    imageUrl: { type: String, required: true }, // base64 or CDN URL
    subject: { type: String, required: true },
    heading: { type: String, required: true },
    product_link: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Ad || mongoose.model("Ad", adSchema);
