import express from "express";
const router = express.Router();
import Stock from "../models/Stock.js";
import Bill from "../models/Bill.js";
import AuditLog from "../models/AuditLog.js"; // ⬅️ Include this

router.get("/monthly-summary", async (req, res) => {
  try {
    // 1️⃣ Stock Purchases (New Entries)
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

    // 2️⃣ Updated Stock Entries (from AuditLog)
    const updateSummary = await AuditLog.aggregate([
      {
        $match: {
          action: "Updated",
          enteredQuantity: { $gt: 0 },
        },
      },
      {
        $addFields: {
          yearMonth: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
          updatedValue: { $multiply: ["$purchaseRate", "$enteredQuantity"] },
        },
      },
      {
        $group: {
          _id: "$yearMonth",
          updatedEntries: { $sum: 1 },
          totalUpdatedPurchase: { $sum: "$updatedValue" },
        },
      },
    ]);

    // 3️⃣ Bill Summary
    const billSummary = await Bill.aggregate([
      {
        $addFields: {
          yearMonth: { $dateToString: { format: "%Y-%m", date: "$date" } },
        },
      },
      {
        $group: {
          _id: "$yearMonth",
          totalBills: { $sum: 1 },
          totalSales: { $sum: "$grandTotal" },
        },
      },
    ]);

    // 4️⃣ Merge All Summaries
    const monthlyMap = {};

    stockSummary.forEach((entry) => {
      monthlyMap[entry._id] = {
        month: entry._id,
        stockEntries: entry.stockEntries,
        totalPurchase: entry.totalPurchase,
        updatedEntries: 0,
        totalUpdatedPurchase: 0,
        totalBills: 0,
        totalSales: 0,
      };
    });

    updateSummary.forEach((entry) => {
      if (!monthlyMap[entry._id]) {
        monthlyMap[entry._id] = {
          month: entry._id,
          stockEntries: 0,
          totalPurchase: 0,
          updatedEntries: entry.updatedEntries,
          totalUpdatedPurchase: entry.totalUpdatedPurchase,
          totalBills: 0,
          totalSales: 0,
        };
      } else {
        monthlyMap[entry._id].updatedEntries = entry.updatedEntries;
        monthlyMap[entry._id].totalUpdatedPurchase = entry.totalUpdatedPurchase;
      }
    });

    billSummary.forEach((entry) => {
      if (!monthlyMap[entry._id]) {
        monthlyMap[entry._id] = {
          month: entry._id,
          stockEntries: 0,
          totalPurchase: 0,
          updatedEntries: 0,
          totalUpdatedPurchase: 0,
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
      combinedPurchase: entry.totalPurchase + entry.totalUpdatedPurchase,
      totalProfit: entry.totalSales - (entry.totalPurchase + entry.totalUpdatedPurchase),
    }));

    summary.sort((a, b) => new Date(a.month) - new Date(b.month));
    res.status(200).json(summary);
  } catch (err) {
    console.error("Monthly Summary Error:", err.message);
    res.status(500).json({ message: "Failed to fetch monthly summary" });
  }
});

export default router;
