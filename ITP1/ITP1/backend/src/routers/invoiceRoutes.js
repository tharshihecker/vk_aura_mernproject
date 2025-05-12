import express from 'express';
import { addInvoice, deleteInvoice, getAllInvoices } from '../controllers/invoiceController.js';

const router = express.Router();


router.post('/', addInvoice);


router.delete('/:invoiceNumber', deleteInvoice);


router.get('/', getAllInvoices);

export default router;


//C:\Destop\Linga\ITP1\ITP1\backend\src\routers\invoiceRoutes.js