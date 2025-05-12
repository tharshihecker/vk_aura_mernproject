import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  otpExpiration: { type: Date, required: true },
});

export default mongoose.model("TempUser", tempUserSchema);
