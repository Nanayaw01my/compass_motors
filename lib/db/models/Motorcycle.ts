import mongoose, { Schema, Document } from "mongoose";

export interface IMotorcycle extends Omit<Document, "model"> {
  brand: string;
  model: string;
  year: number;
  engineNumber?: string;
  chassisNumber?: string;
  sellingPrice: number;
  installmentPrice: number;
  quantity: number;
  description?: string;
  images: string[];
  status: "available" | "reserved" | "sold";
  createdAt: Date;
  updatedAt: Date;
}

const MotorcycleSchema = new Schema<IMotorcycle>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    engineNumber: String,
    chassisNumber: String,
    sellingPrice: { type: Number, required: true },
    installmentPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    description: String,
    images: [String],
    status: { type: String, enum: ["available", "reserved", "sold"], default: "available" },
  },
  { timestamps: true }
);

export default mongoose.models.Motorcycle || mongoose.model<IMotorcycle>("Motorcycle", MotorcycleSchema);
