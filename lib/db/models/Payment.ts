import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  receiptNumber: string;
  contract: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  paymentMethod: "paystack" | "cash" | "mobile-money" | "bank-transfer";
  paystackReference?: string;
  paystackStatus?: string;
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
    contract: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["paystack", "cash", "mobile-money", "bank-transfer"],
      required: true,
    },
    paystackReference: String,
    paystackStatus: String,
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    notes: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
