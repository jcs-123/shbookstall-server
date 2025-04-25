import express from "express";
import Stock from "../models/Stock.js";
import { v4 as uuidv4 } from "uuid";
import auditLogRoutes from "./auditLogRoutes.js"; // Import auditLogRoutes

const router = express.Router();

// Add Stock with Auto Barcode
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
      editedBy, // Assuming user info comes from the frontend
    } = req.body;

    if (
      !itemName || !code || !purchaseRate || !retailRate ||
      !vendorDetails || !quantity || !minQuantity
    ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const totalValue = purchaseRate * quantity;
    const barcode = `BS-${uuidv4().slice(0, 8)}`;

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

    // Log the action (Adding stock)
    await auditLogRoutes.logAction(
      "created",
      "stock",
      { itemName, code, purchaseRate, retailRate, vendorDetails, quantity, minQuantity, totalValue, barcode },
      editedBy
    );

    res.status(201).json({ message: "Stock added successfully", stock: newStock });
  } catch (err) {
    console.error("Add Stock Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch All Stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Stock Entry
router.put("/:id", async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Log the action (Updating stock)
    await auditLogRoutes.logAction(
      "updated",
      "stock",
      { ...updatedStock.toObject(), ...req.body }, // Store the updated data
      req.body.editedBy // Assuming the user who edited is sent in the body
    );

    res.json({ message: "Stock updated successfully", stock: updatedStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Stock
router.delete("/:id", async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);

    // Log the action (Deleting stock)
    await auditLogRoutes.logAction(
      "deleted",
      "stock",
      { _id: deletedStock._id, itemName: deletedStock.itemName }, // You can store other details as necessary
      req.body.editedBy // Assuming the user who deleted is sent in the body
    );

    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count Report — Stock Summary
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
        remainingCount: quantity,
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

// Low Stock
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

// Get Stock by Code
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
