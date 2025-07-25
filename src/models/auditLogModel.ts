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
  | "updateCategory"
  | "deleteCategory"
  | "addProduct"
  | "updateProduct"
  | "removeProduct"
  | "addCustomer"
  | "updateCustomer"
  | "deleteCustomer"
  | "createSale"
  | "updateSale"
  | "deleteSale";

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
        "updateCategory",
        "deleteCategory",
        "addProduct",
        "updateProduct",
        "removeProduct",
        "addCustomer",
        "updateCustomer",
        "deleteCustomer",
        "createSale",
        "updateSale",
        "deleteSale",
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
