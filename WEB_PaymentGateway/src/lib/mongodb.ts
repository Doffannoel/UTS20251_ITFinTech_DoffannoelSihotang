import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectDB() {
  if (global._mongooseConn) return global._mongooseConn;
  global._mongooseConn = mongoose.connect(MONGODB_URI, {
    // @ts-ignore
    dbName: process.env.MONGODB_DB || undefined,
  });
  return global._mongooseConn;
}
