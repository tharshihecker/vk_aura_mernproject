import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Package from "../models/Package.js";
import Product from "../models/Product.js";
import sendStatusUpdateEmail from "../utils/sendStatusUpdateEmail.js";

const router = express.Router();

// Place an order
router.post("/", async (req, res) => {
  try {
    const { user, userName, userPhone, items, total, location } = req.body;

    if (!user || !items || items.length === 0 || !total || !location || !userPhone) {
      return res.status(400).json({ message: "Invalid order data! All fields are required." });
    }

    const enrichedItems = [];

    for (const item of items) {
      const matchedPackage = await Package.findOne({ name: item.name }).populate("products.productId");
      if (!matchedPackage) return res.status(400).json({ message: `Package '${item.name}' not found` });

      const enrichedProducts = matchedPackage.products.map(p => ({
        productId: p.productId._id,
        productName: p.productId.name,
        quantity: p.quantity,
        costPriceAtOrder: p.productId.costPrice,
        sellingPriceAtOrder: p.productId.sellingPrice
      }));

      enrichedItems.push({
        name: item.name,
        price: matchedPackage.totalPrice,
        finalPrice: matchedPackage.finalPrice,
        discountRate: matchedPackage.discount || 0,
        quantity: item.quantity,
        products: enrichedProducts
      });
    }

    const newOrder = new Order({
      user,
      userName,
      userPhone,
      items: enrichedItems,
      total,
      location,
      status: "pending",
      createdAt: new Date()
    });

    await newOrder.save();
    res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("❌ Order Placement Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

// Admin: Fetch all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

// User: Fetch orders by user ID
router.get("/:userId", async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

// Confirm order
router.put("/:id/confirm", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) throw new Error("Order not found");
    if (order.status === "success") throw new Error("Order is already confirmed");

    const requiredQuantities = {};
    for (const item of order.items) {
      const pkg = await Package.findOne({ name: item.name }).session(session);
      if (!pkg) throw new Error(`Package '${item.name}' not found`);

      for (const { productId, quantity } of pkg.products) {
        const totalRequired = quantity * item.quantity;
        const key = productId.toString();
        requiredQuantities[key] = (requiredQuantities[key] || 0) + totalRequired;
      }
    }

    const productIds = Object.keys(requiredQuantities);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    for (const product of products) {
      const requiredQty = requiredQuantities[product._id.toString()];
      if (product.quantity < requiredQty) throw new Error(`Insufficient stock for '${product.name}'`);
    }

    for (const product of products) {
      product.quantity -= requiredQuantities[product._id.toString()];
      await product.save({ session });
    }

    order.status = "success";
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    await sendStatusUpdateEmail({
      orderId: order._id,
      status: "success",
      email: order.user,
      name: order.userName,
    });

    res.json({ message: "✅ Order confirmed and inventory updated!", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Confirm Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Ship Order
router.put("/:id/ship", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error("Order not found");
    if (order.status !== "success") throw new Error("Order must be confirmed before shipping");

    order.status = "shipped";
    await order.save();

    await sendStatusUpdateEmail({
      orderId: order._id,
      status: "shipped",
      email: order.user,
      name: order.userName,
    });

    res.json({ message: "✅ Order marked as shipped", order });
  } catch (error) {
    console.error("❌ Ship Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Deliver Order
router.put("/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error("Order not found");
    if (order.status !== "shipped") throw new Error("Only shipped orders can be delivered");

    order.status = "delivered";
    await order.save();

    await sendStatusUpdateEmail({
      orderId: order._id,
      status: "delivered",
      email: order.user,
      name: order.userName,
    });

    res.json({ message: "✅ Order marked as delivered", order });
  } catch (error) {
    console.error("❌ Deliver Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Remove Order
router.put("/:id/remove", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error("Order not found");

    order.status = "removed";
    await order.save();

    await sendStatusUpdateEmail({
      orderId: order._id,
      status: "removed",
      email: order.user,
      name: order.userName,
    });

    res.json({ message: "✅ Order marked as removed", order });
  } catch (error) {
    console.error("❌ Remove Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Cancel Order
router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error("Order not found");
    if (order.status !== "pending") throw new Error("Only pending orders can be canceled");

    order.status = "canceled";
    await order.save();

    await sendStatusUpdateEmail({
      orderId: order._id,
      status: "canceled",
      email: order.user,
      name: order.userName,
    });

    res.json({ message: "✅ Order canceled successfully!", order });
  } catch (error) {
    console.error("❌ Cancel Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
