import * as amqp from "amqplib";
import config from "../config";
import logger from "../utils/logger";

class QueueService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly RENDER_QUEUE = "render_jobs";
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 1000;

  async connect(): Promise<void> {
    let retries = 0;

    while (retries < this.MAX_RETRIES) {
      try {
        this.connection = await amqp.connect(config.rabbitMqUrl);
        this.channel = await this.connection.createChannel();

        // Declare queue with durability
        await this.channel.assertQueue(this.RENDER_QUEUE, {
          durable: true,
        });

        // Set prefetch to process one job at a time
        await this.channel.prefetch(1);

        logger.info("RabbitMQ connected successfully");

        // Handle connection events
        this.connection.on("error", (error: Error) => {
          logger.error("RabbitMQ connection error:", error);
        });

        this.connection.on("close", () => {
          logger.info("RabbitMQ connection closed, attempting to reconnect...");
          setTimeout(() => this.connect(), this.RETRY_DELAY);
        });

        break;
      } catch (error) {
        retries++;
        logger.error(
          `Failed to connect to RabbitMQ (attempt ${retries}/${this.MAX_RETRIES}):`,
          error
        );

        if (retries >= this.MAX_RETRIES) {
          throw new Error("Could not establish RabbitMQ connection");
        }

        await this.delay(this.RETRY_DELAY * retries);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async publishJob(jobData: Record<string, any>): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const message = Buffer.from(JSON.stringify(jobData));

    const result = this.channel.sendToQueue(this.RENDER_QUEUE, message, {
      persistent: true,
    });

    if (!result) {
      throw new Error("Failed to publish job to queue");
    }

    logger.info(`Job published to queue: ${jobData.jobId}`);
  }

  async consumeJobs(callback: (msg: Record<string, any>) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    await this.channel.consume(this.RENDER_QUEUE, async (msg: amqp.ConsumeMessage | null) => {
      if (msg === null) return;

      try {
        const jobData = JSON.parse(msg.content.toString());
        console.log(">>>>>>>>>>>>>>>>>> jobData: ", jobData);
        await callback(jobData);

        // Acknowledge the message
        this.channel!.ack(msg);
      } catch (error) {
        logger.error("Error processing job:", error);

        // Reject and requeue the message
        this.channel!.nack(msg, false, true);
      }
    });

    logger.info("Started consuming jobs from queue");
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      logger.info("RabbitMQ disconnected");
    } catch (error) {
      logger.error("Error during RabbitMQ disconnect:", error);
    }
  }

  getChannel(): amqp.Channel | null {
    return this.channel;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Clear all messages from the render queue
   * @param queueName - Optional queue name, defaults to RENDER_QUEUE
   * @returns Promise<number> - Number of messages purged
   */
  async clearQueue(queueName?: string): Promise<number> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const targetQueue = queueName || this.RENDER_QUEUE;

    try {
      // Purge all messages from the queue
      const result = await this.channel.purgeQueue(targetQueue);

      logger.info(`Cleared ${result.messageCount} messages from queue: ${targetQueue}`);

      return result.messageCount;
    } catch (error) {
      logger.error(`Error clearing queue ${targetQueue}:`, error);
      throw new Error(`Failed to clear queue: ${targetQueue}`);
    }
  }
}

export const queueService = new QueueService();
