// models/deletedUser.model.js
import mongoose from 'mongoose';

const deletedUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  profilePic: { type: String, default: '' }, // ✅ Add this line
  reason: String,
  deletedAt: { type: Date, default: Date.now },
});

export default mongoose.model('DeletedUser', deletedUserSchema);
