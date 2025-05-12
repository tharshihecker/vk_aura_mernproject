import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';



// Add a new purchase
export const addPurchase = async (req, res) => {
  try {
    const { supplierName, purchaseDate, items, discount = 0 } = req.body;

    // Validate required fields
    if (!supplierName || !purchaseDate || !items || items.length === 0) {
      return res.status(400).json({ message: 'Supplier Name, Purchase Date, and items are required.' });
    }

    const purchaseNumber = `PUR-${Date.now()}`; // Unique Purchase Number
    let totalAmount = 0;

    // Process each item in the purchase
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
      }

      // Ensure quantity is a valid number
      item.quantity = Number(item.quantity);
      if (isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product ${product.name}` });
      }

      // Update stock (Increase Quantity)
      product.quantity += item.quantity;
      await product.save();

      // Set additional item details
      item.productName = product.name;
      item.costPrice = product.costPrice;
      item.amount = item.quantity * product.costPrice;
      totalAmount += item.amount;
    }

    // Apply discount
    const discountAmount = (totalAmount * discount) / 100;
    const amountAfterDiscount = totalAmount - discountAmount;

    // Create and save the purchase
    const newPurchase = new Purchase({
      supplierName,
      purchaseNumber,
      purchaseDate: new Date(purchaseDate),
      items,
      totalAmount,
      discount,
      amountAfterDiscount,
    });

    await newPurchase.save();
    res.status(201).json({ message: 'Purchase recorded successfully', purchaseNumber });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ message: 'Error recording purchase', error: error.message });
  }
};


// Get all purchases
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate({
      path: 'items.productId',
      select: 'name costPrice',
    });
    
    if (purchases.length === 0) {
      return res.status(404).json({ message: 'No purchases found.' });
    }
    
    res.status(200).json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases', error: error.message });
  }
};

// Delete a purchase and update inventory
export const deletePurchase = async (req, res) => {
  try {
    const { purchaseNumber } = req.params;
    const purchase = await Purchase.findOne({ purchaseNumber });

    if (!purchase) {
      return res.status(404).json({ message: `Purchase with number ${purchaseNumber} not found.` });
    }

    for (const item of purchase.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity; // Reverse stock update
        await product.save();
      }
    }

    await purchase.deleteOne();
    res.status(200).json({ message: 'Purchase deleted and inventory updated successfully.' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ message: 'Error deleting purchase', error: error.message });
  }
};
