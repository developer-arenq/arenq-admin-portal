const mongoose = require("mongoose");
const { Schema } = mongoose;

const VariantSchema = new Schema(
  {
    sku: String,

    model: String,
    voltage: String,
    capacity: String,

    price: Number,
    MRP: Number,
    stock: Number,

    image: String
  },
  { _id: false });

const ProductSchema = new Schema(
  {
    // Basic
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    desc: String,
    short_desc: String,
    long_description: String,

    // Category
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand_id: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },

    subcat: String,

    // Pricing
    price: Number,
    MRP: Number,
    tax: {
      type: Number,
      default: 0,
    },

    sku: String,

    // Inventory
    stock: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    out_of_stock: {
      type: Boolean,
      default: false,
    },

    // Media
    images: [String],
    videos: [String],
    main_image: String,
    alt_text: String,

    // Documents
    datasheet: String,
    catalogue: String,
    manual: String,
    warranty: String,

    // Specifications (Generic)
    specifications: {
      type: Map,
      of: String,
    },

    // Features
    key_features: [String],
    applications: [String],
    advantages: [String],
    compatible_devices: [String],

    // FAQ
    faq: [
      {
        question: String,
        answer: String,
      },
    ],

    // SEO
    seo: {
      title: String,
      description: String,
      keywords: [String],
      canonical: String,
    },

    // Tags
    tags: [String],

    label: String,

    featured: {
      type: String,
      enum: [
        "new_arrival",
        "best_seller",
        "top_deals",
        "featured",
        "none",
      ],
      default: "none",
    },

    // Variants
    variants: [VariantSchema],

    // Reviews
    rating: {
      type: Number,
      default: 0,
    },

    review_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);