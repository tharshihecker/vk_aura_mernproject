import express from 'express';
import OrderRating from '../models/OrderRating.js';

const router = express.Router();

// POST /api/order-rating/add
router.post('/add', async (req, res) => {
  const { userEmail, orderId, rating } = req.body;

  if (!userEmail || !orderId || rating == null) {
    return res.status(400).json({ message: "User email, order ID, and rating are required." });
  }

  try {
    const newRating = new OrderRating({ userEmail, orderId, rating });
    await newRating.save();
    res.status(201).json({ success: true, message: "Rating saved successfully." });
  } catch (error) {
    console.error("Error saving rating:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/order-rating
router.get('/', async (req, res) => {
  try {
    const ratings = await OrderRating.find();
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
