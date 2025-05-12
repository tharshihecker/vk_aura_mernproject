// src/routers/ViewPaymentRoutes.js
import express from 'express';
import { getPaymentDetails } from '../controllers/ViewPaymentDetails.js';

const router = express.Router();

router.get('/', getPaymentDetails);

export default router;
