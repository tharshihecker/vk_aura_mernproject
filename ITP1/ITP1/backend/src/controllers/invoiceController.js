import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

// Create a new invoice
export const addInvoice = async (req, res) => {
  try {
    const { customerName, invoiceDate, items, discount = 0 } = req.body;

    if (!customerName || !invoiceDate) {
      return res.status(400).json({ message: 'Customer Name and Invoice Date are required.' });
    }

    const invoiceNumber = `INV-${Date.now()}`;
    let totalAmount = 0;

    // Process each invoice item
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      // Deduct the sold quantity from the product stock
      product.quantity -= item.quantity;
      await product.save();

      // Set additional properties for the invoice item, including costPrice
      item.productName = product.name;
      item.rate = product.sellingPrice;
      item.costPrice = product.costPrice;
      item.amount = item.quantity * product.sellingPrice;
      totalAmount += item.amount;
    }

    const discountAmount = (totalAmount * discount) / 100;
    const amountAfterDiscount = totalAmount - discountAmount;

    const newInvoice = new Invoice({
      customerName,
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      items,
      totalAmount,
      discount,
      amountAfterDiscount,
    });

    await newInvoice.save();
    res.status(201).json({ message: 'Invoice created successfully', invoiceNumber });
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error });
  }
};

// Delete an invoice and restore product inventory
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: `Invoice with number ${invoiceNumber} not found.` });
    }

    // Restore the product quantity for each item
    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    await invoice.deleteOne();
    res.status(200).json({ message: 'Invoice deleted and inventory restored successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
};

// Get all invoices with populated product details
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate({
      path: 'items.productId',
      select: 'name unit sellingPrice quantity costPrice',
    });

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found.' });
    }

    res.status(200).json({ invoices });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};
