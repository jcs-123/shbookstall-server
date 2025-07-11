import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    // ✅ 1. Bills (Receipts)
    const billEntries = await Bill.find({
      date: { $gte: fromDate, $lte: toDate },
    }).lean();

    const receipts = billEntries.map((bill) => ({
      date: bill.date,
      type: "Receipt",
      particulars: `Bill to ${bill.buyerName} ${
        bill.discount > 0 ? `(Discount: ₹${bill.discount})` : ""
      }`,
      receipt: bill.grandTotal,
      payment: 0,
    }));

    // ✅ 2. Initial Stock Purchases (Payments)
    const stockEntries = await Stock.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).lean();

    const stockPayments = stockEntries.map((stock) => ({
      date: stock.createdAt,
      type: "Payment",
      particulars: `Purchased ${stock.itemName}`,
      receipt: 0,
      payment: stock.purchaseRate * stock.quantity,
      category: "New Purchase"
    }));

    // ✅ 3. Updated Stock Purchases from AuditLog (Separate in UI, NOT in main total)
    const auditUpdates = await AuditLog.find({
      action: "Updated",
      enteredQuantity: { $gt: 0 },
      timestamp: { $gte: fromDate, $lte: toDate },
    }).lean();

    const updatePayments = auditUpdates.map((log) => ({
      date: log.timestamp,
      type: "Payment",
      particulars: `Updated Purchase: ${log.itemName}`,
      receipt: 0,
      payment: log.enteredQuantity * log.purchaseRate,
      isUpdate: true,
      category: "Updated Purchase"
    }));

    // ✅ Merge entries for full table
    const allEntries = [...receipts, ...stockPayments, ...updatePayments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // ✅ Totals
    const totalReceipts = receipts.reduce((sum, e) => sum + e.receipt, 0);
    const totalNewPurchase = stockPayments.reduce((sum, e) => sum + e.payment, 0);
    const totalUpdatedPurchase = updatePayments.reduce((sum, e) => sum + e.payment, 0);

    res.json({
      entries: allEntries,
      totals: {
        receipt: totalReceipts,
        newPurchase: totalNewPurchase,       // 📦 Initial purchases
        updatedPurchase: totalUpdatedPurchase, // 🔁 Updates
        totalPayment: totalNewPurchase + totalUpdatedPurchase,
      },
    });
  } catch (err) {
    console.error("Daybook Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;


// const router = express.Router();

// router.get("/", async (req, res) => {
//   const { from, to } = req.query;

//   try {
//     const fromDate = new Date(from);
//     const toDate = new Date(to);
//     toDate.setHours(23, 59, 59, 999);

//     const billEntries = await Bill.find({
//       date: { $gte: fromDate, $lte: toDate },
//     }).lean();

//     const receipts = billEntries.map((bill) => ({
//       date: bill.date,
//       type: "Receipt",
//       particulars: `Bill to ${bill.buyerName} ${
//         bill.discount > 0 ? `(Discount: ₹${bill.discount})` : ""
//       }`,
//       receipt: bill.grandTotal,  // use final discounted amount
//       payment: 0,
//     }));

//     const stockEntries = await Stock.find({
//       createdAt: { $gte: fromDate, $lte: toDate },
//     }).lean();

//     const payments = stockEntries.map((stock) => ({
//       date: stock.createdAt,
//       type: "Payment",
//       particulars: `Purchased ${stock.itemName}`,
//       receipt: 0,
//       payment: stock.purchaseRate * stock.quantity,
//     }));

//     const allEntries = [...receipts, ...payments].sort(
//       (a, b) => new Date(a.date) - new Date(b.date)
//     );

//     res.json(allEntries);
//   } catch (err) {
//     console.error("Daybook Fetch Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });
