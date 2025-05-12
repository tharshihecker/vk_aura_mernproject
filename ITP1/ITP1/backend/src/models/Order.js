import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userName: { type: String },
  userPhone: { type: String },
  items: [
    {
      name: String,
      price: Number,
      finalPrice: Number,
      quantity: { type: Number, min: 1, max: 100 },
      discountRate: Number,
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          productName: String,
          quantity: Number,
          costPriceAtOrder: Number,
          sellingPriceAtOrder: Number
        }
      ]
    }
  ],
  total: { type: Number, required: true },
  location: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
