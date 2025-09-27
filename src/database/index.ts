import { Sequelize } from "sequelize";
import config from "../config";
import logger from "../utils/logger";

const sequelize = new Sequelize(config.databaseUrl, {
  logging: config.nodeEnv === "development" ? (msg) => logger.debug(msg) : false,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    // Sync models in development
    if (config.nodeEnv === "development") {
      await sequelize.sync({ alter: true });
      logger.info("Database models synchronized");
    }
  } catch (error) {
    logger.error("Unable to connect to database:", error);
    process.exit(1);
  }
};

export default sequelize;
