import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { validateEnv } from "@/lib/env";

validateEnv();

const MONGODB_URI = process.env.MONGODB_URI!;

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
    const password = await bcrypt.hash("ADMIN123", 12);
    // Upsert: update existing admin or create new one
    await Admin.findOneAndUpdate(
      { $or: [{ username: "admin" }, { email: "cmsspass@gmail.com" }] },
      {
        name: "Compass Motors Admin",
        username: "admin",
        email: "cmsspass@gmail.com",
        password,
        phone: "0593920144",
        role: "admin",
      },
      { upsert: true, new: true }
    );
    console.log("Admin account ready.");
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
