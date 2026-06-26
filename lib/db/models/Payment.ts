import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  receiptNumber: string;
  contract: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  paymentMethod: "cash" | "mobile-money" | "bank-transfer";
  balanceBefore: number;
  balanceAfter: number;
  notes?: string;
  recordedBy?: Types.ObjectId;
  status: "pending" | "successful" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    contract:      { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    customer:      { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount:        { type: Number, required: true, min: 0.01 },
    paymentMethod: {
      type: String,
      enum: ["cash", "mobile-money", "bank-transfer"],
      required: true,
    },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter:  { type: Number, required: true, min: 0 },
    notes:         String,
    recordedBy:    { type: Schema.Types.ObjectId, ref: "Admin" },
    status:        { type: String, enum: ["pending", "successful", "failed"], default: "successful" },
  },
  { timestamps: true }
);

PaymentSchema.index({ contract: 1 });
PaymentSchema.index({ customer: 1 });
PaymentSchema.index({ customer: 1, status: 1 });
PaymentSchema.index({ contract: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ receiptNumber: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
