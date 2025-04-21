import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const totalStockItems = await Stock.countDocuments();

    const bills = await Bill.find();

    const totalBills = bills.length;
    let totalSales = 0;
    let totalPurchase = 0;

    bills.forEach((bill) => {
      totalSales += bill.totalAmount || 0;
      totalPurchase += bill.totalPurchaseAmount || 0;
    });

    const totalProfit = totalSales - totalPurchase;

    res.json({
      totalStockItems,
      totalBills,
      totalSales,
      totalPurchase,
      totalProfit,
    });
  } catch (error) {
    console.error("Error in summary route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
