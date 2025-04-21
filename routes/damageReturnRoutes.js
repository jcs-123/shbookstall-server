import express from "express";
import DamageReturn from "../models/DamageReturn.js";
import Stock from "../models/Stock.js";

const router = express.Router();

// Add Damage/Return/Add-on Entry
router.post("/add", async (req, res) => {
  try {
    const { code, actionType, quantity, reason, user } = req.body;

    const stockItem = await Stock.findOne({ code });
    if (!stockItem) return res.status(404).json({ message: "Item not found" });

    if (quantity > stockItem.quantity) {
      return res.status(400).json({ message: "Not enough stock to remove this quantity" });
    }

    const originalQty = stockItem.quantity;
    const damagedQty = Number(quantity);
    const originalRate = stockItem.retailRate; // ✅ Retail rate
    const remainingQty = originalQty - damagedQty;

    // Handle Add-on
    if (actionType === "Add-on") {
      if (remainingQty === 0) {
        return res.status(400).json({ message: "Cannot perform Add-on when quantity becomes zero." });
      }

      const damagedAmount = damagedQty * originalRate;
      const addonRate = damagedAmount / remainingQty;
      const updatedRetailRate = Math.round(originalRate + addonRate); // ✅ Rounded retail rate
      const updatedTotal = updatedRetailRate * remainingQty;

      stockItem.retailRate = updatedRetailRate;
      stockItem.totalValue = updatedTotal;
    }

    // Common update: reduce quantity
    stockItem.quantity = remainingQty;
    await stockItem.save();

    // Save Damage/Return entry
    const newEntry = new DamageReturn({
      itemName: stockItem.itemName,
      code,
      actionType,
      quantity: damagedQty,
      reason,
      user,
      date: new Date(),
    });

    await newEntry.save();

    res.status(200).json({ message: `${actionType} entry recorded and stock updated.` });
  } catch (err) {
    console.error("Damage return error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Fetch Damage/Return history
router.get("/history", async (req, res) => {
  try {
    const history = await DamageReturn.find().sort({ date: -1 });
    res.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// DELETE damage report by ID
router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await DamageReturn.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ message: "Damage report not found" });
      }
  
      res.json({ message: "Damage report deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err.message);
      res.status(500).json({ message: "Server error while deleting" });
    }
  });
export default router;
