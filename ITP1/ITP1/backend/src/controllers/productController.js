import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs';
import Package from '../models/Package.js';

// ✅ Utility to delete an image file
const deleteImage = (imagePath) => {
  if (imagePath) {
    try {
      fs.unlinkSync(path.resolve(imagePath));
    } catch (err) {
      console.error('Error deleting image file:', err);
    }
  }
};

// ✅ Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, sku, sellingPrice, costPrice, quantity, unit } = req.body;


    if (await Product.findOne({ sku })) {
      return res.status(400).json({ message: "SKU already exists. Please use a unique SKU." });
    }

    const imagePath = req.file?.path;

    if (!imagePath) {
      console.error('❌ Image upload failed: no imagePath received');
      return res.status(400).json({ message: "Image upload failed" });
    }

    const newProduct = new Product({
      name,
      sku,
      sellingPrice,
      costPrice,
      quantity,
      unit,
      image: imagePath,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error('❌ Error adding product:', error); // Make sure we print the real error!
    res.status(500).json({ message: "Internal server error" });
  }
};



// ✅ Update product by SKU
const updateProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const { name, sellingPrice, costPrice, quantity, unit } = req.body;

    const existingProduct = await Product.findOne({ sku });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle new image and delete the old one if uploaded
    if (req.file) {
      deleteImage(existingProduct.image);
      existingProduct.image = req.file.path;
    }

    // Update fields
    Object.assign(existingProduct, { name, sellingPrice, costPrice, quantity, unit });

    await existingProduct.save();
    res.status(200).json({ message: "Product updated successfully", product: existingProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};





const deleteProduct = async (req, res) => {
  try {
    const { sku } = req.params;

    // ✅ Find the product first
    const product = await Product.findOne({ sku });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ Check if any package uses this product
    const isUsedInPackage = await Package.findOne({
      "products.productId": product._id
    });

    if (isUsedInPackage) {
      return res.status(400).json({
        message: `Cannot delete product '${product.name}' because it is part of a package.`
      });
    }

    // ✅ Delete product and image
    await Product.findOneAndDelete({ sku });
    deleteImage(product.image);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { addProduct, updateProduct, deleteProduct, getProducts };
