// C:\Users\Admin\Desktop\new\ITP1\backend\src\routers\packageRoutes.js

import express from 'express';
import multer from 'multer';
import { createPackage, getPackages, getPackageById, updatePackage, deletePackage } from '../controllers/PackageController.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js'; // 👈 make sure this is correct path



const router = express.Router();


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Packages', // 👈 save package images inside Cloudinary folder "Packages"
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => Date.now().toString(), // 👈 unique filename
  },
});

const upload = multer({ storage });


// Routes
router.post('/', upload.single('image'), createPackage);
router.get('/', getPackages);
router.get('/:id', getPackageById);
router.put('/:id', upload.single('image'), updatePackage);
router.delete('/:id', deletePackage);

export default router;  // Use export default
