import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";
import StockHistory from "../models/StockHistory.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const billEntries = await Bill.find({
      date: { $gte: fromDate, $lte: toDate },
    }).lean();

    const receipts = billEntries.map((bill) => ({
      date: bill.date,
      type: "Receipt",
      particulars: `Bill to ${bill.buyerName} ${
        bill.discount > 0 ? `(Discount: ₹${bill.discount})` : ""
      }`,
      receipt: bill.grandTotal,  // use final discounted amount
      payment: 0,
    }));

    const stockHistories = await StockHistory.find({
      date: { $gte: fromDate, $lte: toDate },
    }).lean();
    
    const payments = stockHistories.map((entry) => ({
      date: entry.date,
      type: "Payment",
      particulars: `Purchased ${entry.itemName}`,
      receipt: 0,
      payment: entry.purchaseRate * entry.quantityAdded,
    }));

    const allEntries = [...receipts, ...payments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.json(allEntries);
  } catch (err) {
    console.error("Daybook Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
