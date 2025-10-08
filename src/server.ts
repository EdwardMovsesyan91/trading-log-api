// src/server.ts
import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { connectMongo } from "./config/db.js";
import mongoose from "mongoose"; // for safe disconnect on shutdown

const PORT = env.portNumber ?? 4000;

let server: import("http").Server;
let shuttingDown = false;

async function start() {
  try {
    // 1) DB connect
    const mongoUri = process.env.MONGODB_URI || env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is missing");
    await connectMongo(mongoUri);

    // 2) HTTP server
    server = app.listen(PORT, () => {
      logger.info(`Server listening on :${PORT} (env=${env.NODE_ENV})`);
    });

    // 3) Process-level traps
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("uncaughtException", (err) => {
      logger.error({ err }, "Uncaught exception");
      shutdown("uncaughtException", 1);
    });
    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled promise rejection");
      shutdown("unhandledRejection", 1);
    });
  } catch (err) {
    logger.error({ err }, "Startup failed");
    process.exit(1);
  }
}

async function shutdown(reason: string, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`${reason} received, starting graceful shutdown...`);

  // Close HTTP server (with a hard cutoff)
  const closeServer = new Promise<void>((resolve) => {
    if (!server) return resolve();
    server.close((err?: Error) => {
      if (err) logger.error({ err }, "Error during server close");
      resolve();
    });
    // Force after 10s if sockets won’t drain
    setTimeout(() => {
      logger.warn("Forcing HTTP shutdown after 10s timeout");
      resolve();
    }, 10_000).unref();
  });

  // Close DB
  const closeDb = (async () => {
    try {
      // Close active connections; ignore if already closed
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      logger.info("MongoDB connection closed");
    } catch (err) {
      logger.error({ err }, "Error closing MongoDB");
    }
  })();

  await Promise.allSettled([closeServer, closeDb]);

  logger.info("Shutdown complete. Exiting.");
  process.exit(exitCode);
}

void start();
