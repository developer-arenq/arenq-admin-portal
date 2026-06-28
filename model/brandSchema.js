// import { models, model, Schema } from "mongoose";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      //   required: true,
    },
    email: {
      type: String,
      //   required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
