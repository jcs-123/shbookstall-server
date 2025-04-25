import express from "express";
import Stock from "../models/Stock.js";
import AuditLog from "../models/AuditLog.js"; // Import AuditLog Model
import { v4 as uuidv4 } from "uuid"; // ✅ FIX: import uuid

const router = express.Router();

// ✅ Add Stock with Auto Barcode
router.post("/", async (req, res) => {
  try {
    const {
      itemName,
      code,
      purchaseRate,
      retailRate,
      vendorDetails,
      quantity,
      minQuantity,
      editedBy,
    } = req.body;

    if (
      !itemName || !code || !purchaseRate || !retailRate ||
      !vendorDetails || !quantity || !minQuantity
    ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const totalValue = purchaseRate * quantity;
    const barcode = `BS-${uuidv4().slice(0, 8)}`; // ✅ Auto barcode

    const newStock = new Stock({
      itemName,
      code,
      purchaseRate,
      retailRate,
      vendorDetails,
      quantity,
      minQuantity,
      totalValue,
      editedBy,
      barcode,
    });

    await newStock.save();

    // ✅ Add Audit Log for Stock Added
    await AuditLog.create({
      action: "Stock Added",
      itemName,
      stockId: newStock._id,
      user: editedBy || "Unknown",
      details: {
        code,
        purchaseRate,
        retailRate,
        vendorDetails,
        quantity,
        minQuantity,
        totalValue,
        barcode,
      },
    });

    res.status(201).json({ message: "Stock added successfully", stock: newStock });
  } catch (err) {
    console.error("Add Stock Error:", err); // 👀 Debug log
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch All Stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Stock Entry
router.put("/:id", async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // ✅ Add Audit Log for Stock Updated
    await AuditLog.create({
      action: "Stock Updated",
      itemName: updatedStock.itemName,
      stockId: updatedStock._id,
      user: req.body.editedBy || "Unknown",
      details: {
        updatedFields: req.body,
      },
    });

    res.json({ message: "Stock updated successfully", stock: updatedStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Stock
router.delete("/:id", async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);

    if (deletedStock) {
      // ✅ Add Audit Log for Stock Deleted
      await AuditLog.create({
        action: "Stock Deleted",
        itemName: deletedStock.itemName,
        stockId: deletedStock._id,
        user: "Admin", // You can change this to capture the actual user who deleted
        details: {
          code: deletedStock.code,
          quantity: deletedStock.quantity,
        },
      });
    }

    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Count Report — Stock Summary
router.get("/count-report", async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = {};
    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const stocks = await Stock.find(query);

    const report = stocks.map((stock) => {
      const quantity = stock.quantity || 0;
      const purchaseRate = stock.purchaseRate || 0;
      const retailRate = stock.retailRate || 0;

      const purchaseAmount = quantity * purchaseRate;
      const retailAmount = quantity * retailRate;
      const profit = retailAmount - purchaseAmount;

      return {
        _id: stock._id,
        createdAt: stock.createdAt,
        itemName: stock.itemName,
        code: stock.code,
        totalCount: quantity,
        remainingCount: quantity, // Add your own logic if there's a sale count
        purchaseRate,
        retailRate,
        purchaseAmount,
        retailAmount,
        profit,
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Low Stock Items
router.get("/low-stock", async (req, res) => {
  try {
    const lowStockItems = await Stock.find({
      $expr: { $lte: ["$quantity", "$minQuantity"] },
    });
    res.json(lowStockItems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
});

// ✅ Fetch Stock by Code
router.get("/get-by-code/:code", async (req, res) => {
  try {
    const stock = await Stock.findOne({ code: req.params.code });
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ View Audit Logs
router.get("/audit-log", async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
