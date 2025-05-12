// src/controllers/ViewPaymentDetails.js
import Payment from '../models/Payment.js';

export const getPaymentDetails = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment details" });
  }
};
