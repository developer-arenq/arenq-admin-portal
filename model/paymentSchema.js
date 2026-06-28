import { models, model, Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    payment_id: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = models.Payment || model("Payment", paymentSchema);
