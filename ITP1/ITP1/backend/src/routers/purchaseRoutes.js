// backend/routes/purchaseRoutes.js
import express from 'express';
import { addPurchase, getPurchases, deletePurchase } from '../controllers/purchaseController.js';
const router = express.Router();

router.post('/', addPurchase);

router.get('/', getPurchases);

router.delete('/:purchaseNumber', deletePurchase);

export default router;