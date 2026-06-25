import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null, seeded: false };
if (!global.mongoose) global.mongoose = cached;

async function seedAdmin() {
  if (cached.seeded) return;
  cached.seeded = true;
  try {
    const Admin = (await import("@/lib/db/models/Admin")).default;
    const exists = await Admin.findOne({ email: "cmsspass@gmail.com" });
    if (!exists) {
      const password = await bcrypt.hash("CompassAdmin2024!", 12);
      await Admin.create({
        name: "Compass Motors Admin",
        email: "cmsspass@gmail.com",
        password,
        phone: "0593920144",
        role: "admin",
      });
      console.log("Admin account created automatically.");
    }
  } catch (e) {
    console.error("Auto-seed failed:", e);
  }
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  await seedAdmin();
  return cached.conn;
}
