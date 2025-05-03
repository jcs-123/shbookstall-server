import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";

const router = express.Router();

router.get("/totalpurchase", async (req, res) => {
  try {
    const stocks = await Stock.find();
    const totalPurchase = stocks.reduce((sum, item) => {
      return sum + (item.purchaseRate * item.quantity);
    }, 0);
    const totalStockItems = stocks.length;

    // Fetch total number of bills
    const totalBills = await Bill.countDocuments();

    // Calculate total sales (sum of the grandTotal from all bills)
    const totalSales = await Bill.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$grandTotal" } } }
    ]);

    const totalSalesAmount = totalSales.length > 0 ? totalSales[0].totalSales : 0;

    // Calculate total profit
    const totalProfit = totalSalesAmount - totalPurchase;

    res.status(200).json({
      totalPurchase,
      totalStockItems,
      totalBills,
      totalSales: totalSalesAmount,
      totalProfit,  // Add total profit to the response
    });
  } catch (err) {
    console.error("Error calculating total purchase:", err);
    res.status(500).json({ message: "Failed to calculate total purchase" });
  }
});

export default router;
