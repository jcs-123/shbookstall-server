import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: String, // The action taken (e.g., Stock Added, Stock Updated, Stock Deleted)
  itemName: String, // Item name associated with the action
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" }, // Stock ID referenced
  user: String, // User performing the action
  timestamp: { type: Date, default: Date.now }, // Timestamp of the action
  details: mongoose.Schema.Types.Mixed, // Details of the action (can be updated fields or deleted fields)
});

export default mongoose.model("AuditLog", auditLogSchema);
