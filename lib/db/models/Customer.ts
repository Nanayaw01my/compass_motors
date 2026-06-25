import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerId: string;
  // Personal
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  occupation?: string;
  residentialAddress?: string;
  gpsAddress?: string;
  // Identification
  ghanaCardNumber?: string;
  ghanaCardFront?: string;
  ghanaCardBack?: string;
  passportPhoto?: string;
  // Emergency Contact
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyAddress?: string;
  // Guarantor
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  guarantorOccupation?: string;
  guarantorGhanaCard?: string;
  guarantorPhoto?: string;
  // Account
  username: string;
  password: string;
  role: "customer";
  status: "active" | "suspended" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    altPhone: String,
    email: { type: String, lowercase: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    occupation: String,
    residentialAddress: String,
    gpsAddress: String,
    ghanaCardNumber: String,
    ghanaCardFront: String,
    ghanaCardBack: String,
    passportPhoto: String,
    emergencyName: String,
    emergencyRelationship: String,
    emergencyPhone: String,
    emergencyAddress: String,
    guarantorName: String,
    guarantorPhone: String,
    guarantorAddress: String,
    guarantorOccupation: String,
    guarantorGhanaCard: String,
    guarantorPhoto: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    status: { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
