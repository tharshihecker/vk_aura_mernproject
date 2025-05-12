import Payment from '../models/Payment.js';
import User from '../models/user.model.js'; // Import User model

// Process Payment
export const processPayment = async (req, res) => {
  try {
    const { cardNumber, holderName, expiryDate, cvv, totalPrice, userId } = req.body;

    if (!cardNumber || !holderName || !expiryDate || !cvv || totalPrice === undefined || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPayment = new Payment({
      userId,
      userName: user.name,    // Save user name directly
      userPhone: user.phone,  // Save user phone directly
      cardNumber,
      holderName,
      expiryDate,
      cvv,
      totalPrice,
      paymentStatus: "pending",
    });

    await newPayment.save();

    res.json({ success: true, message: "Payment processed and stored successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get All Payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find(); // No populate needed!
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to load payments' });
  }
};
