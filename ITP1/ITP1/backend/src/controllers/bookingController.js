import Booking from '../models/Booking.js';
import Priest from '../models/Priest.js';

export const bookPriest = async (req, res) => {
  try {
    const { priestId, event, date } = req.body;
    // Use authenticated user ID if available
    const userId = req.user && req.user.userId ? req.user.userId : '000000000000000000000000';

    const priest = await Priest.findById(priestId);
    if (!priest) return res.status(404).json({ error: 'Priest not found' });

    const eventDate = new Date(date);
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    const twoMonthsFromNow = new Date(now);

    twoMonthsFromNow.setMonth(now.getMonth() + 2);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    if (eventDate < sevenDaysFromNow) {
      return res.status(400).json({ error: 'Events must be booked at least 7 days in advance' });
    }
    if (eventDate > twoMonthsFromNow) {
      return res.status(400).json({ error: 'Events cannot be booked more than 2 months in advance' });
    }

    // Compare dates in ISO format
    const normalizedRequestedDate = eventDate.toISOString();
    const isUnavailable = priest.unavailableDates.some(d => new Date(d).toISOString() === normalizedRequestedDate);
    if (isUnavailable) {
      return res.status(400).json({ error: 'Priest unavailable on this date' });
    }

    // Explicitly set booking status to "Booked"
    const booking = new Booking({ 
      user: userId, 
      priest: priestId, 
      event, 
      date: eventDate,
      status: 'Booked'
    });
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const eventDate = new Date(booking.date);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 7) {
      return res.status(400).json({ error: 'Bookings can only be cancelled at least 7 days before the event' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user && req.user.userId ? req.user.userId : '000000000000000000000000';
    const bookings = await Booking.find({ user: userId }).populate('priest');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
