import express from 'express';
import { bookPriest, cancelBooking, getUserBookings } from '../controllers/bookingController.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create a booking for a priest
router.post('/', bookPriest);

// Cancel a booking
router.put('/:id/cancel', cancelBooking);

// Get bookings for the logged-in user
router.get('/user', getUserBookings);

// **Admin endpoint:** Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('priest');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
