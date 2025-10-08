import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { connectMongo } from "./config/db.js";

await connectMongo(process.env.MONGODB_URI || "");

const server = app.listen(env.portNumber, () => {
  logger.info(
    `Server listening on port ${env.portNumber} (env=${env.NODE_ENV})`
  );
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down...`);
  server.close((err?: Error) => {
    if (err) {
      logger.error({ err }, "Error during server close");
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
