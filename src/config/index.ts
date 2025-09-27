import dotenv from "dotenv";

dotenv.config({ path: [".env"] });

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  prefix: string;
  rabbitMqUrl: string;
  redisUrl: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/playable_ads",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
  prefix: process.env.API_PREFIX || "/api/v1",
  rabbitMqUrl: process.env.RABBITMQ_URL || "amqp://localhost",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

export default config;
