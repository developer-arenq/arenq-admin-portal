import { models, model, Schema } from "mongoose";

const faqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = models.FAQ || model("FAQ", faqSchema);
