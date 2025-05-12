import mongoose from "mongoose";

const orderRatingSchema = new mongoose.Schema(
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Order"  // 🧠 (optional, if you want to populate later)
      },
      userEmail: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      }
    },
    {
      timestamps: true,
    }
  );
  

const OrderRating = mongoose.model("OrderRating", orderRatingSchema);

export default OrderRating;
