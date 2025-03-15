import mongoose, { Schema, Document, Model } from "mongoose";

interface IEmailVerify extends Document {
  author: mongoose.Schema.Types.ObjectId;
  hashedCode: string;
  createdAt: Date;
}

const emailVerifySchema: Schema<IEmailVerify> = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  hashedCode: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800,
  },
});

const emailVerifyModel: Model<IEmailVerify> = mongoose.model(
  "verifyMail",
  emailVerifySchema
);

export default emailVerifyModel ;
