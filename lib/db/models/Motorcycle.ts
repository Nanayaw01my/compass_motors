import mongoose, { Schema, Document } from "mongoose";

export interface IMotorcycle extends Omit<Document, "model"> {
  brand: string;
  model: string;
  year: number;
  engineNumber?: string;
  chassisNumber?: string;
  color?: string;
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
    brand:            { type: String, required: true, trim: true },
    model:            { type: String, required: true, trim: true },
    year:             { type: Number, required: true, min: 1990, max: new Date().getFullYear() + 2 },
    engineNumber:     { type: String, trim: true },
    chassisNumber:    { type: String, trim: true },
    color:            { type: String, trim: true },
    sellingPrice:     { type: Number, required: true, min: 0 },
    installmentPrice: { type: Number, required: true, min: 0 },
    quantity:         { type: Number, default: 1, min: 0 },
    description:      String,
    images:           [String],
    status:           { type: String, enum: ["available", "reserved", "sold"], default: "available" },
  },
  { timestamps: true }
);

MotorcycleSchema.index({ status: 1 });
MotorcycleSchema.index({ brand: 1, model: 1 });
MotorcycleSchema.index({ createdAt: -1 });

export default mongoose.models.Motorcycle || mongoose.model<IMotorcycle>("Motorcycle", MotorcycleSchema);
