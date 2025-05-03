import express from "express";
import Stock from "../models/Stock.js";
import AuditLog from "../models/AuditLog.js"; // ✅ include audit log model

const router = express.Router();

// ✅ Add Stock — use simple `code` as barcode
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
      barcode: code, // ✅ use code as barcode
    });

    await newStock.save();

    // ✅ Log the addition
    await AuditLog.create({
      action: "Added",
      itemName,
      code,
      editedBy,
      enteredQuantity: quantity,
    });

    res.status(201).json({ message: "Stock added successfully", stock: newStock });
  } catch (err) {
    console.error("Add Stock Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get All Stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ Update Stock and Add Audit Log
router.put("/:id", async (req, res) => {
  try {
    const {
      quantity: updatedQuantityFromClient,
      editedBy,
      auditInfo, // contains oldQuantity, addedQuantity, updatedQuantity
      ...otherUpdates
    } = req.body;

    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const oldQuantity = stock.quantity || 0;
    const addedQuantity = auditInfo?.addedQuantity || 0;
    const newQuantity = oldQuantity + addedQuantity;

    const updatedTotalValue =
      parseFloat(stock.purchaseRate) * parseFloat(newQuantity);

    // Save a copy of old data
    const oldData = { ...stock.toObject() };

    // Update the stock item
    stock.set({
      ...otherUpdates,
      quantity: newQuantity,
      totalValue: updatedTotalValue,
      editedBy,
    });

    const updatedStock = await stock.save();

    // Save to Audit Log
    await AuditLog.create({
      action: "Stock Updated",
      itemName: stock.itemName,
      code: stock.code,
      editedBy,
      oldQuantity: oldQuantity,
      addedQuantity: addedQuantity,
      updatedQuantity: newQuantity,
      editedAt: new Date(),
      details: {
        oldData,
        newData: updatedStock,
      },
    });

    res.json({
      message: "Stock updated successfully",
      stock: updatedStock,
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Server error during stock update" });
  }
});

// ✅ Delete Stock with Audit Log
router.delete("/:id", async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);

    if (deletedStock) {
      await AuditLog.create({
        action: "Deleted",
        itemName: deletedStock.itemName,
        code: deletedStock.code,
        editedBy: req.body.editedBy || "Unknown",
      });
    }

    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Count Report
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

// ✅ Low Stock Report
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

// ✅ Get Stock by Code
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

// ✅ Get Audit Logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
