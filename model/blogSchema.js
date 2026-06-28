import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    content: { type: String, required: true },

    image: { type: String }, // main image

    meta_title: String,
    meta_description: String,
    keywords: [String],

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },

    related_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    product_slug: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);