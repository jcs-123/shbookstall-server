import express from "express";
import Bill from "../models/Bill.js";
import Stock from "../models/Stock.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// @route POST /api/bills
router.post("/", async (req, res) => {
  try {
    const { buyerName, items, payment } = req.body;

    // Generate unique receipt number
    const receiptNumber = "REC-" + uuidv4().slice(0, 8).toUpperCase();

    // Calculate total amount
    let totalAmount = 0;

    const itemDetails = await Promise.all(
      items.map(async (item) => {
        const product = await Stock.findOne({ code: item.code });

        if (!product) throw new Error(`Item with code ${item.code} not found`);

        const amount = product.retailRate * item.qty;
        totalAmount += amount;

        // Update stock count
        product.quantity -= item.qty;
        await product.save();

        return {
          name: product.itemName,
          code: item.code,
          qty: item.qty,
          rate: product.retailRate,
          amount
        };
      })
    );

    const balance = payment - totalAmount;

    const newBill = new Bill({
      receiptNumber,
      buyerName,
      items: itemDetails,
      totalAmount,
      payment,
      balance
    });

    await newBill.save();

    res.status(201).json({
      message: "Bill saved successfully",
      receiptNumber,
      totalAmount,
      balance,
      data: newBill
    });

  } catch (error) {
    console.error("Billing error:", error.message);
    res.status(500).json({ message: "Failed to submit bill", error: error.message });
  }
});

// GET all bills or filter by date
router.get("/", async (req, res) => {
  try {
    const { from, to, search } = req.query;
    let query = {};

    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } }
      ];
    }

    const bills = await Bill.find(query).sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bills" });
  }
});


// DELETE /api/bills/:id
router.delete('/:id', async (req, res) => {
  try {
    const billId = req.params.id;
    // Logic to find and delete the bill by billId
    const deletedBill = await Bill.findByIdAndDelete(billId);
    if (!deletedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.status(200).json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
