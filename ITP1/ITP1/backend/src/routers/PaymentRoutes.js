import express from 'express';
import { processPayment, getAllPayments } from '../controllers/PaymentController.js';

const router = express.Router();

router.post('/', processPayment); // POST /api/payment
router.get('/viewPaymentDetails', getAllPayments); // GET /api/payment/viewPaymentDetails

export default router;
