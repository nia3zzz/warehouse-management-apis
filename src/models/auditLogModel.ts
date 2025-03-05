import mongoose, { Document, Schema, Model } from "mongoose";

interface IAuditLog extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  action: string;
  description: string;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  action: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
});

const AuditLog: Model<IAuditLog> = mongoose.model("AuditLog", auditLogSchema);

export { AuditLog };
