import { models, model, Schema } from "mongoose";

const policySchema = new Schema(
  {
    product_category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    table: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = models.Policy || model("Policy", policySchema);
