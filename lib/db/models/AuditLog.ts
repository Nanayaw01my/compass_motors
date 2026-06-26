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
    userId:     { type: Schema.Types.ObjectId, required: true },
    userRole:   { type: String, enum: ["admin", "customer"], required: true },
    action:     { type: String, required: true },
    resource:   { type: String, required: true },
    resourceId: String,
    details:    String,
    ipAddress:  String,
    userAgent:  String,
  },
  { timestamps: true, capped: false }
);

AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
// Auto-delete audit logs after 180 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
