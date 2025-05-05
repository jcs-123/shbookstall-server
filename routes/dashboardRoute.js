import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";
import AuditLog from "../models/AuditLog.js"; // ✅ MISSING IMPORT

const router = express.Router();


// GET: /api/dashboard/totalpurchase
router.get("/totalpurchase", async (req, res) => {
  try {
    const stocks = await Stock.find();
    const auditLogs = await AuditLog.find({
      action: "Updated",
      enteredQuantity: { $gt: 0 },
    });

    const totalPurchaseFromStock = stocks.reduce(
      (sum, item) => sum + item.purchaseRate * item.quantity,
      0
    );

    const totalPurchaseFromUpdates = auditLogs.reduce(
      (sum, log) => sum + (log.purchaseRate || 0) * (log.enteredQuantity || 0),
      0
    );

    const totalPurchase = totalPurchaseFromStock + totalPurchaseFromUpdates;

    const totalStockItems = stocks.length;
    const bills = await Bill.find();
    const totalBills = bills.length;
    const totalSales = bills.reduce((sum, b) => sum + b.grandTotal, 0);
    const totalProfit = totalSales - totalPurchase;

    res.json({
      totalPurchase,
      totalStockItems,
      totalBills,
      totalSales,
      totalProfit,
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;


// import express from "express";
// import Bill from "../models/Bill.js";  // Import your Bill model
// import Stock from "../models/Stock.js";

// const router = express.Router();

// router.get("/totalpurchase", async (req, res) => {
//   try {
//     const stocks = await Stock.find();
//     const totalPurchase = stocks.reduce((sum, item) => {
//       return sum + (item.purchaseRate * item.quantity);
//     }, 0);
//     const totalStockItems = stocks.length;

//     // Fetch total number of bills
//     const totalBills = await Bill.countDocuments();

//     // Calculate total sales (sum of the saleAmount or totalAmount from all bills)
//     const totalSales = await Bill.aggregate([
//       { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
//     ]);

//     const totalSalesAmount = totalSales.length > 0 ? totalSales[0].totalSales : 0;

//     // Calculate total profit
//     const totalProfit = totalSalesAmount - totalPurchase;

//     res.status(200).json({
//       totalPurchase,
//       totalStockItems,
//       totalBills,
//       totalSales: totalSalesAmount,
//       totalProfit,  // Add total profit to the response
//     });
//   } catch (err) {
//     console.error("Error calculating total purchase:", err);
//     res.status(500).json({ message: "Failed to calculate total purchase" });
//   }
// });

// export default router;
