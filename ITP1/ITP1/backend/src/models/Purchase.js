// backend/models/Purchase.js
import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  purchaseNumber: { type: String, required: true, unique: true },
  purchaseDate: { type: Date, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      costPrice: { type: Number, required: true },
      amount: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Discount percentage
  amountAfterDiscount: { type: Number }, // Final amount after discount
});

export default mongoose.model('Purchase', PurchaseSchema);