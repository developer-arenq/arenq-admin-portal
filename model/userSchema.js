import { models, model, Schema } from "mongoose";
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enterPassword) {
  
  return await bcrypt.compare(enterPassword, this.password);
};

//we are hashing the password

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  console.log("password converting into hashing");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

module.exports = models.User || model("User", userSchema);
