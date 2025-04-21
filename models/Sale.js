// models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  // Define the fields you need, for example:
  receiptNumber: String,
  buyerName: String,
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  totalAmount: Number,
  payment: Number,
  balance: Number,
  date: { type: Date, default: Date.now },
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
