import { models, model, Schema } from "mongoose";
import User from "../model/userSchema";

const userAddressSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    address_line: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postal_code: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    enable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = models.Address || model("Address", userAddressSchema);
