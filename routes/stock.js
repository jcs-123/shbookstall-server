import express from "express";
import Stock from "../models/Stock.js";
import AuditLog from "../models/AuditLog.js"; // Make sure to include the `.js` extension
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
    // Save audit log for adding stock
    await AuditLog.create({
      action: `Added stock: ${newStock.itemName}`,
      user: req.user?.username || "Unknown", // Use real user data here
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

    // Save audit log for editing stock
    await AuditLog.create({
      action: `Edited stock: ${updatedStock.itemName}`,
      user: req.user?.username || "Unknown", // Use real user data here
    });

    res.json({ message: "Stock updated successfully", stock: updatedStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Stock
router.delete("/:id", async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);

    // Save audit log for deleting stock
    await AuditLog.create({
      action: `Deleted stock: ${deletedStock.itemName}`,
      user: req.user?.username || "Unknown", // Use real user data here
    });

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


// GET /api/stock/get-by-code/:code
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



export default router;
