import mongoose, { Schema, Document, Types } from "mongoose";

export interface IContract extends Document {
  contractNumber: string;
  customer: Types.ObjectId;
  motorcycle: Types.ObjectId;
  contractType: "installment" | "work-and-pay";
  sellingPrice: number;
  downPayment: number;
  balance: number;
  weeklyInstallment?: number;
  monthlyInstallment?: number;
  totalPaid: number;
  remainingBalance: number;
  startDate: Date;
  endDate?: Date;
  nextPaymentDate?: Date;
  status: "active" | "completed" | "overdue" | "suspended" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    contractNumber:    { type: String, required: true, unique: true },
    customer:          { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    motorcycle:        { type: Schema.Types.ObjectId, ref: "Motorcycle", required: true },
    contractType:      { type: String, enum: ["installment", "work-and-pay"], required: true },
    sellingPrice:      { type: Number, required: true, min: 0 },
    downPayment:       { type: Number, default: 0, min: 0 },
    balance:           { type: Number, required: true, min: 0 },
    weeklyInstallment: { type: Number, min: 0 },
    monthlyInstallment:{ type: Number, min: 0 },
    totalPaid:         { type: Number, default: 0, min: 0 },
    remainingBalance:  { type: Number, required: true, min: 0 },
    startDate:         { type: Date, required: true },
    endDate:           Date,
    nextPaymentDate:   Date,
    status: {
      type: String,
      enum: ["active", "completed", "overdue", "suspended", "cancelled"],
      default: "active",
    },
    notes: String,
  },
  { timestamps: true }
);

ContractSchema.index({ customer: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ customer: 1, status: 1 });
ContractSchema.index({ motorcycle: 1 });
ContractSchema.index({ createdAt: -1 });
ContractSchema.index({ contractNumber: 1 });

export default mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);
