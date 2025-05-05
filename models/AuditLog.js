import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: String,
  itemName: String,
  code: String,
  oldQuantity: Number,
  enteredQuantity: Number,
  updatedQuantity: Number,
  purchaseRate: Number,
  editedBy: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
