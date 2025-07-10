// routes/summaryRoute.js
import express from "express";
const router = express.Router();
import Stock from "../models/Stock.js";
import Bill from "../models/Bill.js";

// ✅ Monthly Summary Route
router.get("/monthly-summary", async (req, res) => {
  try {
    const stockSummary = await Stock.aggregate([
      {
        $addFields: {
          yearMonth: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalValue: { $multiply: ["$purchaseRate", "$quantity"] },
        },
      },
      {
        $group: {
          _id: "$yearMonth",
          stockEntries: { $sum: 1 },
          totalPurchase: { $sum: "$totalValue" },
        },
      },
    ]);

    const billSummary = await Bill.aggregate([
      {
        $addFields: {
          yearMonth: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$yearMonth",
          totalBills: { $sum: 1 },
          totalSales: { $sum: "$totalAmount" }, // Use "grandTotal" if your model uses that
        },
      },
    ]);

    const monthlyMap = {};

    stockSummary.forEach((entry) => {
      monthlyMap[entry._id] = {
        month: entry._id,
        stockEntries: entry.stockEntries,
        totalPurchase: entry.totalPurchase,
        totalBills: 0,
        totalSales: 0,
      };
    });

    billSummary.forEach((entry) => {
      if (!monthlyMap[entry._id]) {
        monthlyMap[entry._id] = {
          month: entry._id,
          stockEntries: 0,
          totalPurchase: 0,
          totalBills: entry.totalBills,
          totalSales: entry.totalSales,
        };
      } else {
        monthlyMap[entry._id].totalBills = entry.totalBills;
        monthlyMap[entry._id].totalSales = entry.totalSales;
      }
    });

    const summary = Object.values(monthlyMap).map((entry) => ({
      ...entry,
      totalProfit: entry.totalSales - entry.totalPurchase,
    }));

    summary.sort((a, b) => new Date(a.month) - new Date(b.month));

    res.status(200).json(summary);
  } catch (err) {
    console.error("Monthly Summary Error:", err.message);
    res.status(500).json({ message: "Failed to fetch monthly summary" });
  }
});

export default router;
