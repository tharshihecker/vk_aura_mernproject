import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priest: { type: mongoose.Schema.Types.ObjectId, ref: 'Priest', required: true },
  event: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' },
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
