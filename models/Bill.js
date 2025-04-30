const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  receiptNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  buyerName: String,
  items: [
    {
      code: String,
      qty: Number,
    }
  ],
  totalAmount: {                
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
  discount: {
    type: Number,
    default: 0,  // Default discount is 0 if not provided
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to calculate the total amount after applying the discount
billSchema.pre('save', function (next) {
  // Calculate total amount after discount
  const itemsTotal = this.items.reduce((sum, item) => sum + (item.qty * item.retailRate), 0);  // Assuming `retailRate` exists in each item
  this.totalAmount = itemsTotal - this.discount;

  // Calculate balance after payment
  this.balance = this.payment - this.totalAmount;
  
  next();
});

module.exports = mongoose.model("Bill", billSchema);




// const mongoose = require("mongoose");
// const billSchema = new mongoose.Schema({
//   receiptNumber: { type: String, required: true, unique: true },
//   buyerName: String,
//   items: [
//     {
//       code: String,
//       qty: Number,
//     }
//   ],
//   totalAmount: {                // ✅ Add this field
//     type: Number,
//     required: true,
//   },
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

// // const mongoose = require("mongoose");

// // const billSchema = new mongoose.Schema({
// //   receiptNumber: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //   },
// //   buyerName: String,
// //   items: [
// //     {
// //       code: String,
// //       qty: Number,
// //     }
// //   ],
// //   payment: {
// //     type: Number,
// //     required: true,
// //   },
// //   balance: {
// //     type: Number,
// //     required: true,
// //     default: 0,
// //   },
// //   date: {
// //     type: Date,
// //     default: Date.now,
// //   },
// // });

// // module.exports = mongoose.model("Bill", billSchema);