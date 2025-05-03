// models/StockHistory.js
import mongoose from "mongoose";

const stockHistorySchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  itemName: String,
  code: String,
  quantityAdded: Number,
  purchaseRate: Number,
  date: { type: Date, default: Date.now },
  editedBy: String,
});

export default mongoose.model("StockHistory", stockHistorySchema);
