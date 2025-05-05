import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";
import AuditLog from "../models/AuditLog.js"; // 👈 Import this

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    // ✅ 1. Bill Receipts
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

    // ✅ 2. Initial Stock Purchases
    const stockEntries = await Stock.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).lean();

    const stockPayments = stockEntries.map((stock) => ({
      date: stock.createdAt,
      type: "Payment",
      particulars: `Purchased ${stock.itemName}`,
      receipt: 0,
      payment: stock.purchaseRate * stock.quantity,
    }));

    // ✅ 3. Valid Purchase Updates (from AuditLog)
    const auditUpdates = await AuditLog.find({
      action: "Updated",
      enteredQuantity: { $gt: 0 },
      updatedAt: { $gte: fromDate, $lte: toDate },
    }).lean();

    const auditPayments = auditUpdates
      .filter(
        (log) =>
          log.purchaseRate !== log.previousPurchaseRate ||
          log.previousQuantity === 0
      )
      .map((log) => ({
        date: log.updatedAt,
        type: "Payment",
        particulars: `Purchased ${log.itemName} (Update)`,
        receipt: 0,
        payment: log.enteredQuantity * log.purchaseRate,
      }));

    // ✅ Combine & Sort All
    const allEntries = [...receipts, ...stockPayments, ...auditPayments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.json(allEntries);
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
