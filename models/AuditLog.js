import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: String,
  itemName: String,
  code: String,
  editedBy: String,
  enteredQuantity: Number,
  oldQuantity: Number,
  updatedQuantity: Number,
  details: Object,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
