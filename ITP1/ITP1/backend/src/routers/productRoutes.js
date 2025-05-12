import express from 'express';
import { addProduct, deleteProduct, updateProduct, getProducts } from '../controllers/productController.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// ✅ Setup Cloudinary Storage properly
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Products', // 👈 Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => Date.now().toString(), // 👈 Unique ID
  },
});

const upload = multer({ storage }); // ✅ Correct multer setup

// ✅ Now use it here properly
router.get('/', getProducts);
router.post('/add', upload.single('image'), addProduct);  // << very important to have upload.single('image')
router.delete('/:sku', deleteProduct);
router.put('/:sku', upload.single('image'), updateProduct);

export default router;
