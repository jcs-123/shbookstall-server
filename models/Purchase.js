// models/Purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  // Define the fields you need, for example:
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // Reference to the Item model
  quantity: Number,
  purchaseRate: Number,
  totalAmount: Number,
  vendor: String,
  date: { type: Date, default: Date.now },
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
