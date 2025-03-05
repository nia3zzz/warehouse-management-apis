import mongoose, { Document, Model, Schema } from "mongoose";

interface ISaleOrderItem extends Document {
  salesOrderId: mongoose.Schema.Types.ObjectId;
  productId: mongoose.Schema.Types.ObjectId;
  quantity: number;
  totalPrice: number;
}

const saleOrderItemSchema = new Schema<ISaleOrderItem>(
  {
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaleOrder",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SaleOrderItemModel: Model<ISaleOrderItem> = mongoose.model(
  "SaleOrderItem",
  saleOrderItemSchema
);
export { SaleOrderItemModel };
