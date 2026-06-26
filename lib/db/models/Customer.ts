import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerId: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  occupation?: string;
  residentialAddress?: string;
  gpsAddress?: string;
  ghanaCardNumber?: string;
  ghanaCardFront?: string;
  ghanaCardBack?: string;
  passportPhoto?: string;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyAddress?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  guarantorOccupation?: string;
  guarantorGhanaCard?: string;
  guarantorPhoto?: string;
  username: string;
  password: string;
  role: "customer";
  status: "active" | "suspended" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId:           { type: String, required: true, unique: true },
    fullName:             { type: String, required: true, trim: true },
    phone:                { type: String, required: true, unique: true, trim: true },
    altPhone:             { type: String, trim: true },
    email:                { type: String, lowercase: true, trim: true, sparse: true },
    dateOfBirth:          Date,
    gender:               { type: String, enum: ["male", "female", "other"] },
    occupation:           String,
    residentialAddress:   String,
    gpsAddress:           String,
    ghanaCardNumber:      String,
    ghanaCardFront:       String,
    ghanaCardBack:        String,
    passportPhoto:        String,
    emergencyName:        String,
    emergencyRelationship:String,
    emergencyPhone:       String,
    emergencyAddress:     String,
    guarantorName:        String,
    guarantorPhone:       String,
    guarantorAddress:     String,
    guarantorOccupation:  String,
    guarantorGhanaCard:   String,
    guarantorPhoto:       String,
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 4 },
    role:     { type: String, default: "customer", immutable: true },
    status:   { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
  },
  { timestamps: true }
);

CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ customerId: 1 });
CustomerSchema.index({ status: 1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ fullName: "text" });

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
