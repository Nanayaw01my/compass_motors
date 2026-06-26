import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name:     { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone:    { type: String, trim: true },
    role:     { type: String, default: "admin", immutable: true },
  },
  { timestamps: true }
);

AdminSchema.index({ username: 1 });
AdminSchema.index({ email: 1 });

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
