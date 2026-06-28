import { models, model, Schema } from "mongoose";
import Address from "../model/userAddressSchema";
import Coupon from "../model/couponSchema";
import User from "../model/userSchema";
import Payment from "../model/paymentSchema";

const orderSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    order_items: [
      {
        title: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: [
          {
            type: String,
            required: true,
          },
        ],
        price: {
          type: Number,
          required: true,
        },
        delivery_status: {
          type: String,
          required: true,
          default: "order_confirmed",
        },
        DeliveredAt: {
          type: Date,
        },
      },
    ],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: Coupon,
    },
    shipping_address: {
      type: Schema.Types.ObjectId,
      ref: Address,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    shipping_price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelevered: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    DeleveredAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: Payment,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = models.Order || model("Order", orderSchema);
