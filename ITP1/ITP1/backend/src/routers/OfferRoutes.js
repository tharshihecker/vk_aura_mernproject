import express from "express";
import Offer from "../models/Offer.js";
import Package from "../models/Package.js"; // Import the Package model

const router = express.Router();

// GET: All offers with populated package name
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find().populate("packageId", "name finalPrice");
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching offers", error: err });
  }
});

// POST: Add new offer
router.post("/", async (req, res) => {
  const { packageId, offerMessage } = req.body;

  if (!packageId || !offerMessage) {
    return res.status(400).json({ message: "Package and offer message required" });
  }

  try {
    // Check if package exists
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    const offer = new Offer({ packageId, offerMessage });
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ message: "Failed to add offer", error: err });
  }
});

// PUT: Update offer
router.put("/:id", async (req, res) => {
  const { offerMessage } = req.body;

  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { offerMessage },
      { new: true }
    );
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: "Error updating offer", error: err });
  }
});

// DELETE: Delete offer
router.delete("/:id", async (req, res) => {
  try {
    const result = await Offer.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Offer not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting offer", error: err });
  }
});

// PUT: Mark all offers as read for a specific user
router.put("/mark-all-read/:userId", async (req, res) => {
    try {
      await Offer.updateMany(
        { isReadBy: { $ne: req.params.userId } },
        { $addToSet: { isReadBy: req.params.userId } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Error marking offers as read", error: err });
    }
  });
  
export default router;
