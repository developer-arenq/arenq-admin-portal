import { models, model, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    author: {
      user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },

    product_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
    },

    number_of_likes: {
      type: Number,
      default: 0,
    },

    number_of_dislikes: {
      type: Number,
      default: 0,
    },

    like_by_users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislike_by_users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default models.Review || model("Review", reviewSchema);
