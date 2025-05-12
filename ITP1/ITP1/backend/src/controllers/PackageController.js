
import fs from 'fs';
import path from 'path';
import Package from '../models/Package.js';  // Add the .js extension
import Product from '../models/Product.js';  // Add the .js extension if not done already
import cloudinary from '../config/cloudinary.js';
import Offer from '../models/Offer.js';




export const createPackage = async (req, res) => {
  try {
    const { name, discount, products } = req.body;
    const image = req.file ? req.file.path : null;

    // ✅ Check if package name already exists
    const existingPackage = await Package.findOne({ name: name.trim() });
    if (existingPackage) {
      return res.status(400).json({ message: "Package name already exists. Please use a different name." });
    }

    let parsedProducts;
    try {
      parsedProducts = JSON.parse(products);
      if (!Array.isArray(parsedProducts)) {
        return res.status(400).json({ message: "Products should be an array" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid products format" });
    }

    const productDetails = await Promise.all(
      parsedProducts.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product ID ${item.productId} not found`);
        return { price: product.sellingPrice, quantity: item.quantity };
      })
    );

    const totalPrice = productDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalPrice = discount ? totalPrice - (totalPrice * (discount / 100)) : totalPrice;

    const newPackage = new Package({
      name: name.trim(),
      discount,
      totalPrice,
      finalPrice,
      image,
      products: parsedProducts,
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: 'Error adding package', error: error.message });
  }
};










// Get all packages
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find().populate('products.productId', 'name sellingPrice unit quantity');
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single package
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('products.productId', 'name sellingPrice unit');
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.status(200).json(pkg);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update package
export const updatePackage = async (req, res) => {
  try {
    const { name, products, discount } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    // Validate discount value
    if (discount && (isNaN(discount) || discount < 0 || discount > 100)) {
      return res.status(400).json({ message: "Discount should be a valid number between 0 and 100" });
    }

    let parsedProducts;
    try {
      parsedProducts = JSON.parse(products);
      if (!Array.isArray(parsedProducts)) {
        return res.status(400).json({ message: "Products should be an array" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid products format" });
    }

    // Validate if all product IDs exist
    const productDetails = await Promise.all(
      parsedProducts.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product ID ${item.productId} not found`);
        return { price: product.sellingPrice, quantity: item.quantity };
      })
    );

    // Calculate total and final price
    const totalPrice = productDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalPrice = discount ? totalPrice - (totalPrice * (discount / 100)) : totalPrice;

    // Update the package in the database
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { name, image, products: parsedProducts, totalPrice, discount, finalPrice },
      { new: true }
    );

    if (!updatedPackage) return res.status(404).json({ message: "Package not found" });

    res.status(200).json({ message: "Package updated successfully", package: updatedPackage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






export const deletePackage = async (req, res) => {
  try {
    const packageId = req.params.id;

    // ✅ Check if any offer is using this package
    const offerUsingPackage = await Offer.findOne({ packageId });
    if (offerUsingPackage) {
      return res.status(400).json({
        message: "Cannot delete package: It is currently used in an active offer.",
      });
    }

    // Proceed with delete
    const deletedPackage = await Package.findByIdAndDelete(packageId);
    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (deletedPackage.image) {
      const imageUrlParts = deletedPackage.image.split('/');
      const imageNameWithExtension = imageUrlParts[imageUrlParts.length - 1];
      const publicId = `Packages/${imageNameWithExtension.split('.')[0]}`;
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log('✅ Image deleted from Cloudinary');
      } catch (err) {
        console.error('❌ Error deleting image from Cloudinary:', err);
      }
    }

    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};