import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  model: { type: String, required: true },
  data: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true }, // Store the user who performed the action
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
