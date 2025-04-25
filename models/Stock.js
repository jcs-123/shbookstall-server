import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    code: { type: String, required: true },
    purchaseRate: { type: Number, required: true },
    retailRate: { type: Number, required: true },
    vendorDetails: { type: String, required: true },
    quantity: { type: Number, required: true },
    minQuantity: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    editedBy: { type: String, required: true },
    barcode: { type: String, required: true },
    purchaseHistory: [
      {
        date: { type: Date, default: Date.now },
        quantityAdded: { type: Number },
        vendorDetails: { type: String },
        editedBy: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
