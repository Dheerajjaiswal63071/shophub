import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false
        },
        _id: {
          type: String,
          required: false
        },
        name: String,
        image: String,
        price: Number,
        quantity: Number
      }
    ],

    total: {
      type: Number,
      required: true
    },

    shippingInfo: {
      fullName: String,
      email: String,
      phone: String,
      houseNo: String,
      street: String,
      landmark: String,
      nearBy: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      address: String,
      zipCode: String,
    },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
