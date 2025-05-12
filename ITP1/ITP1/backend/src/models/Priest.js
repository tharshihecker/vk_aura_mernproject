import mongoose from 'mongoose';

const priestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  dailyCharge: { type: Number, required: true },
  unavailableDates: { type: [Date], default: [] },
});

const Priest = mongoose.model('Priest', priestSchema);
export default Priest; // ✅ Change this line to use ES modules
