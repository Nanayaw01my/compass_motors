import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  userRole: "admin" | "customer";
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userRole: { type: String, enum: ["admin", "customer"], required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    details: String,
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
