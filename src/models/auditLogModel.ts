import mongoose, { Document, Schema, Model } from "mongoose";

type IAction =
  | "newAdminAdded"
  | "loginAdmin"
  | "logoutAdmin"
  | "removeAdmin"
  | "addSupplier"
  | "updateSupplier"
  | "deleteSupplier"
  | "createCategory"
  | "addProducts"
  | "removeProducts";

interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: IAction;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "newAdminAdded",
        "loginAdmin",
        "logoutAdmin",
        "removeAdmin",
        "addSupplier",
        "updateSupplier",
        "deleteSupplier",
        "createCategory",
        "addProducts",
        "removeProducts",
      ],
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

const AuditLog: Model<IAuditLog> = mongoose.model("AuditLog", auditLogSchema);

export { AuditLog };
