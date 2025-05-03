const mongoose = require("mongoose");
const billSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  buyerName: String,
  items: [
    {
      code: String,
      itemName: String,
      quantity: Number,
      retailRate: Number,
      amount: Number,
    }
  ],
  totalAmount: { type: Number, required: true },  // Store the original total amount
  grandTotal: { type: Number, required: true },   // Store the discounted amount
  discount: { type: Number, default: 0 },         // Store the discount amount
  balance: { type: Number, required: true },      // Store the balance amount
  payment: { type: Number, required: true },      // Store the amount paid
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Bill", billSchema);