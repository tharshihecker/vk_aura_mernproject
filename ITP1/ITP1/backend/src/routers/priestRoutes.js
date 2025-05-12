import express from 'express';
import multer from 'multer';
import path from 'path';
import { addPriest, getAllPriests, updatePriest, deletePriest, getAvailablePriests } from '../controllers/priestController.js';

const router = express.Router();

// Setup multer storage for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes

// Add a new priest (including photo upload)
router.post('/', upload.single('photoFile'), addPriest);

// Get all priests
router.get('/', getAllPriests);

// Get available priests for a specific date
router.get('/available', getAvailablePriests);

// Update a priest's details (including optional photo upload)
router.put('/:id', upload.single('photoFile'), updatePriest);

// Delete a priest by id and delete the associated photo from the file system
router.delete('/:id', deletePriest);

export default router;
