import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    purchaseRate: { type: Number, required: true },
    retailRate: { type: Number, required: true },
    vendorDetails: { type: String, required: true },
    quantity: { type: Number, required: true },
    minQuantity: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    editedBy: { type: String },
    barcode: { type: String, required: true, unique: true },
  },
  { timestamps: true } // ✅ createdAt and updatedAt
);

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
