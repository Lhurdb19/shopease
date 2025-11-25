import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IFlashSale extends Document {
  productId: string;
  salePrice: number;
  startTime: Date;
  endTime: Date;
  active: boolean;
}

const FlashSaleSchema = new Schema<IFlashSale>(
  {
    productId: { type: String, required: true },
    salePrice: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.FlashSale ||
  model<IFlashSale>("FlashSale", FlashSaleSchema);
