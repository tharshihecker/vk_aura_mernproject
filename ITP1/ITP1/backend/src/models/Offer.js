
import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    offerMessage: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // track users who read
  });
  

export default mongoose.model("Offer", offerSchema);
