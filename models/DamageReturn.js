const mongoose = require("mongoose");

const damageReturnSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  code: { type: String, required: true },
  quantity: { type: Number, required: true },
  actionType: {
    type: String,
    enum: ["Perished", "Return to Vendor", "Add-on"], // ✅ Fix is here
    required: true,
  },
  reason: { type: String },
  user: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DamageReturn", damageReturnSchema);
