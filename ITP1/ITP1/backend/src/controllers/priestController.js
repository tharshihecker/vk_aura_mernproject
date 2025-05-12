import fs from 'fs';
import path from 'path';
import Priest from '../models/Priest.js';
import Booking from '../models/Booking.js';

// Add Priest
export const addPriest = async (req, res) => {
  try {
    const { name, dailyCharge } = req.body;
    // If file is uploaded, use its path. Otherwise, use the photo URL from form
    const photo = req.file ? `/uploads/${req.file.filename}` : req.body.photo;
    const unavailableDates = req.body.unavailableDates ? JSON.parse(req.body.unavailableDates) : [];

    // Remove dates older than today
    const today = new Date();
    const filteredUnavailableDates = unavailableDates.filter(date => new Date(date) >= today);

    const priest = new Priest({ name, photo, dailyCharge, unavailableDates: filteredUnavailableDates });
    await priest.save();
    res.status(201).json(priest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Priests
export const getAllPriests = async (req, res) => {
  try {
    const priests = await Priest.find();
    res.json(priests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Priest
export const updatePriest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dailyCharge, unavailableDates } = req.body;
    let photo;

    if (req.file) {
      // Optionally delete the old photo here if needed
      photo = `/uploads/${req.file.filename}`;
    }

    // Remove dates older than today
    const today = new Date();
    const filteredUnavailableDates = unavailableDates ? JSON.parse(unavailableDates).filter(date => new Date(date) >= today) : [];

    const updateData = {
      name,
      dailyCharge,
      unavailableDates: filteredUnavailableDates,
    };
    if (photo) updateData.photo = photo;

    const priest = await Priest.findByIdAndUpdate(id, updateData, { new: true });
    res.json(priest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Priest
export const deletePriest = async (req, res) => {
  try {
    const { id } = req.params;
    const priest = await Priest.findByIdAndDelete(id);
    // Optionally remove photo file from disk if stored locally
    if (priest && priest.photo && priest.photo.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', priest.photo);
      fs.unlink(filePath, err => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.json({ message: 'Priest deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get available priests for a specific date
export const getAvailablePriests = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required' });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      date: { $gte: start, $lte: end },
      status: 'Booked'
    });
    const bookedPriestIds = bookings.map(booking => booking.priest.toString());

    const availablePriests = await Priest.find({
      _id: { $nin: bookedPriestIds },
      unavailableDates: { $not: { $elemMatch: { $gte: start, $lte: end } } }
    });

    res.json(availablePriests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available priests', error: error.message });
  }
};
