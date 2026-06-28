import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    items: [
      {
        id: mongoose.Schema.Types.ObjectId,

        title: String,

        slug: String,

        thumbnail: String,

        SKU: String,

        image: [String],

        alt_text: String,

        price: Number,

        MRP: Number,

        quantity: Number,

        weight: Number,

        variantValue: String,

        variant: {
          id: mongoose.Schema.Types.ObjectId,

          type: String,

          value: String,

          price: Number,

          MRP: Number,

          tax: Number,
        },

        total: Number,

        taxPercentage: Number,

        taxAmount: Number,
      },
    ],

    shipping: Number,

    subtotal: Number,

    taxPercentage: Number,

    taxAmount: Number,

    total: Number,

    // ==================================
    // ABANDONED CART
    // ==================================

    email_sent: {
      type: Boolean,

      default: false,
    },

    recovered: {
      type: Boolean,

      default: false,
    },

    reminder_count: {
      type: Number,

      default: 0,
    },

    last_activity: {
      type: Date,

      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.models.Cart ||
  mongoose.model("Cart", CartSchema);