import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";

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

    const stockList = await Stock.find().lean();
    const stockMap = {};
    stockList.forEach((stock) => {
      stockMap[stock.code] = stock.retailRate;
    });

    const receipts = billEntries.map((bill) => {
      let totalAmount = 0;
      if (Array.isArray(bill.items)) {
        totalAmount = bill.items.reduce((sum, item) => {
          const rate = stockMap[item.code] || 0;
          return sum + item.qty * rate;
        }, 0);
      }

      return {
        date: bill.date,
        type: "Receipt",
        particulars: `Bill to ${bill.buyerName}`,
        receipt: totalAmount, // use calculated total instead of payment
        payment: 0,
      };
    });

    const stockEntries = await Stock.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).lean();

    const payments = stockEntries.map((stock) => ({
      date: stock.createdAt,
      type: "Payment",
      particulars: `Purchased ${stock.itemName}`,
      receipt: 0,
      payment: stock.purchaseRate * stock.quantity,
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
