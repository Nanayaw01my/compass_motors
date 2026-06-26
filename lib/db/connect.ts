import mongoose from "mongoose";
import { validateEnv } from "@/lib/env";

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

// Pre-computed bcrypt hash of "ADMIN123" with 10 rounds — avoids slow hashing at startup
const ADMIN_DEFAULT_HASH = "$2b$10$fQuymC5srcgkPG1pyr1b2OzTwoKFKyzjz2LZhR01pZcMu4vxNyQq.";

async function seedAdmin() {
  if (cached.seeded) return;
  cached.seeded = true;
  try {
    const Admin = (await import("@/lib/db/models/Admin")).default;
    const exists = await Admin.exists({ $or: [{ username: "admin" }, { email: "cmsspass@gmail.com" }] });
    if (!exists) {
      await Admin.create({
        name: "Compass Motors Admin",
        username: "admin",
        email: "cmsspass@gmail.com",
        password: ADMIN_DEFAULT_HASH,
        phone: "0593920144",
        role: "admin",
      });
      console.log("Admin account created.");
    }
  } catch (e) {
    console.error("Auto-seed failed:", e);
  }
}

export async function connectDB() {
  validateEnv();

  const MONGODB_URI = process.env.MONGODB_URI!;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  // Fire seed in background — don't block the request path
  seedAdmin().catch(console.error);
  return cached.conn;
}
