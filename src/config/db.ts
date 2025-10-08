import mongoose from "mongoose";
import logger from "../utils/logger.js";

export async function connectMongo(uri: string) {
  if (!uri) {
    logger.warn("No MONGODB_URI provided; running with in-memory store only");
    return;
  }
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
    });
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error(
      { err },
      "Failed to connect to MongoDB; continuing without DB"
    );
  }
}

export default connectMongo;


