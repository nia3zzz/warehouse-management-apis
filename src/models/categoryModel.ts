import mongoose, { Document, Schema, Model } from "mongoose";

interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategory> = mongoose.model("Category", categorySchema);
export { Category };
