import express from "express";
import Order from "../models/Order.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

// For resolving font path dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fontPath = path.join(__dirname, "../fonts/NotoSansTamil-Regular.ttf.ttf");

router.get("/product-performance", async (req, res) => {
  console.log("✔️ /product-performance route hit");
  try {
    const { start, end, format } = req.query;
    const match = {};

    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    const data = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      { $unwind: "$items.products" },
      {
        $group: {
          _id: "$items.products.productName",
          unitsSold: { $sum: "$items.products.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$items.products.sellingPriceAtOrder",
                "$items.products.quantity"
              ]
            }
          },
          totalProfit: {
            $sum: {
              $subtract: [
                {
                  $multiply: [
                    "$items.products.sellingPriceAtOrder",
                    "$items.products.quantity"
                  ]
                },
                {
                  $multiply: [
                    "$items.products.costPriceAtOrder",
                    "$items.products.quantity"
                  ]
                }
              ]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // 📤 Excel download
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Product Report");
      sheet.columns = [
        { header: "Product", key: "_id" },
        { header: "Units Sold", key: "unitsSold" },
        { header: "Total Revenue", key: "totalRevenue" },
        { header: "Total Profit", key: "totalProfit" },
      ];
      data.forEach(row => sheet.addRow(row));

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=product_report.xlsx");
      await workbook.xlsx.write(res);
      return res.end();
    }

    // 📤 PDF download
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=product_report.pdf");
    
      const doc = new PDFDocument();

try {
  const tamilFontPath = path.join(__dirname, "../fonts/NotoSansTamil-Regular.ttf");
  doc.registerFont("Tamil", tamilFontPath);
  doc.font("Tamil");
} catch (err) {
  console.error("❌ Font error:", err.message);
  doc.font("Helvetica"); // fallback to built-in font
}

      doc.pipe(res);
    
      doc.fontSize(16).text("Product Performance Report", { align: "center" });
      doc.moveDown();
    
      data.forEach((row) => {
        doc.fontSize(12).text(`Product: ${row._id}`);
        doc.text(`Units Sold: ${row.unitsSold}`);
        doc.text(`Revenue: Rs. ${row.totalRevenue.toFixed(2)}`);
        doc.text(`Profit: Rs. ${row.totalProfit.toFixed(2)}`);
        doc.moveDown();
      });
    
      doc.end();
      return;
    }
    

    // JSON response
    res.json(data);

  } catch (error) {
    console.error("❌ Report generation error:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});


router.get("/order-summary", async (req, res) => {
  try {
    const { start, end, format } = req.query;
    const match = {};

    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    const orders = await Order.find(match).sort({ createdAt: -1 });

    const formatted = orders.map((order) => {
      let totalProfit = 0;
      order.items.forEach((pkg) => {
        let pkgProfit = 0;
        pkg.products.forEach((prod) => {
          pkgProfit += (prod.sellingPriceAtOrder - prod.costPriceAtOrder) * prod.quantity;
        });
        // Subtract package discount
        const discount = (pkg.price - pkg.finalPrice) * pkg.quantity;
        totalProfit += pkgProfit - discount;
      });

      return {
        orderId: order._id,
        userName: order.userName,
        userPhone: order.userPhone,
        location: order.location,
        status: order.status,
        createdAt: order.createdAt,
        total: order.total,
        profit: totalProfit,
      };
    });

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Order Report");

      sheet.columns = [
        { header: "Order ID", key: "orderId" },
        { header: "Customer", key: "userName" },
        { header: "Phone", key: "userPhone" },
        { header: "Location", key: "location" },
        { header: "Status", key: "status" },
        { header: "Date", key: "createdAt" },
        { header: "Total", key: "total" },
        { header: "Profit", key: "profit" },
      ];

      formatted.forEach((row) => sheet.addRow(row));

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=order_report.xlsx");
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=order_report.pdf");

      const doc = new PDFDocument();
      doc.pipe(res);

      doc.fontSize(16).text("Order Summary Report", { align: "center" });
      doc.moveDown();

      formatted.forEach((order) => {
        doc.fontSize(12).text(`Order ID: ${order.orderId}`);
        doc.text(`Customer: ${order.userName}`);
        doc.text(`Phone: ${order.userPhone}`);
        doc.text(`Location: ${order.location}`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Total: Rs. ${order.total.toFixed(2)}`);
        doc.text(`Profit: Rs. ${order.profit.toFixed(2)}`);
        doc.moveDown();
      });

      doc.end();
      return;
    }

    res.json(formatted);
  } catch (error) {
    console.error("❌ Order report error:", error);
    res.status(500).json({ error: "Failed to generate order report" });
  }
});

export default router;
