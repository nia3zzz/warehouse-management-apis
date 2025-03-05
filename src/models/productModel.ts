import mongoose, { Document, Schema, Model } from "mongoose";

interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: mongoose.Schema.Types.ObjectId;
  supplierId: mongoose.Schema.Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> = mongoose.model("Product", productSchema);
export { Product };
