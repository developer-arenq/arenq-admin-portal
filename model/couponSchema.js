import { models, model, Schema } from "mongoose";

const couponSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    coupon_code: {
      type: String,
      required: true,
      unique: true,
    },
    discount_percent: {
      type: Number,
      default: 0,
    },
    flat_discount: {
      type: Number,
      default: 0,
    },
    valid_from: {
      type: String,
      required: true,
    },
    valid_until: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      default: 1000,
    },
    max: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
    },
    refer_by: {
      type: String,
      default: "info@arenq.co.in",
    },
    useby: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = models.Coupon || model("Coupon", couponSchema);
