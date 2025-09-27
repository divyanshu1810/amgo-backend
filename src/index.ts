import app from "./app";
import config from "./config";
import { connectDatabase } from "./database";
import { queueService } from "./queue/Index";
import { RenderWorker } from "./queue/worker";
import logger from "./utils/logger";

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to RabbitMQ
    await queueService.connect();
    await queueService.clearQueue();

    // Start worker in a separate process or thread in production
    // For demo, we'll start it here
    if (config.nodeEnv !== "test") {
      const worker = new RenderWorker();
      worker.start().catch((error) => {
        logger.error("Worker failed to start:", error);
      });
    }

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`
        ################################################
        🚀 Server listening on port: ${config.port}
        🌍 Environment: ${config.nodeEnv}
        📍 API Prefix: ${config.prefix}
        ################################################
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info("Received shutdown signal, closing server gracefully...");

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await queueService.disconnect();
          logger.info("Queue connections closed");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
