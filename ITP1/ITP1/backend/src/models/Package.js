

import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true , unique: true, trim: true },
  image: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Package', packageSchema);
