// const mongoose = require("mongoose");

// const billSchema = new mongoose.Schema({
//   receiptNumber: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   buyerName: String,
//   items: [
//     {
//       code: String,
//       qty: Number,
//     }
//   ],
//   payment: {
//     type: Number,
//     required: true,
//   },
//   balance: {
//     type: Number,
//     required: true,
//     default: 0,
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Bill", billSchema);


const mongoose = require("mongoose");
const billSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  buyerName: String,
  items: [
    {
      code: String,
      qty: Number,
    }
  ],
  totalAmount: {                // ✅ Add this field
    type: Number,
    required: true,
  },
  payment: {
    type: Number,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Bill", billSchema);