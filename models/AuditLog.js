import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: String,
    itemName: String,
    updatedItemName: String,
    code: String,
    editedBy: String,
    oldQuantity: Number,
    updatedQuantity: Number,
    enteredQuantity: Number, // ✅ Add this if not already there
    timestamp: {
        type: Date,
        default: Date.now,
    },
    details: Object,
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
