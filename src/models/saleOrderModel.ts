import mongoose, { Document, Schema, Model } from "mongoose";

interface ISaleOrder extends Document {
  customerId: mongoose.Schema.Types.ObjectId;
  status: "Order Placed" | "Order Delivered";
  totalCost: number;
}

const saleOrderSchema = new Schema<ISaleOrder>(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Order Placed", "Order Delivered"],
      default: "Order Placed",
    },
  },
  {
    timestamps: true,
  }
);

const SaleOrder: Model<ISaleOrder> = mongoose.model<ISaleOrder>(
  "SaleOrder",
  saleOrderSchema
);

export { SaleOrder };
