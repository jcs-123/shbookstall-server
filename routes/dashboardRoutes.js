const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Stock = require("../models/Stock"); // Assuming you have a Stock model
const Bill = require("../models/Bill"); // Assuming you have a Bill model
const Sale = require("../models/Sale"); // Assuming you have a Sale model
const Purchase = require("../models/Purchase"); // Assuming you have a Purchase model

// Dashboard Summary Route
router.get("/summary", async (req, res) => {
  try {
    // Get total stock count
    const totalStockItems = await Stock.countDocuments();

    // Get total bills
    const totalBills = await Bill.countDocuments();

    // Get total sales amount (assuming 'amount' in Sale model)
    const totalSales = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get total purchases (assuming 'amount' in Purchase model)
    const totalPurchase = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Calculate total profit (if needed)
    const totalProfit = totalSales[0]?.total - totalPurchase[0]?.total;

    // Send the summary response
    res.status(200).json({
      totalStockItems,
      totalBills,
      totalSales: totalSales[0]?.total || 0,
      totalPurchase: totalPurchase[0]?.total || 0,
      totalProfit: totalProfit || 0
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
