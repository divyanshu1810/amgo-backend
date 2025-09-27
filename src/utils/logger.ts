import { createLogger, format, transports } from "winston";
import config from "../config";

const { combine, timestamp, colorize, errors, json, simple } = format;

const devFormat = combine(colorize(), simple());

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }), // Capture stack trace
  json()
);

const logger = createLogger({
  level: "info",
  format: config.nodeEnv === "production" ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

export default logger;
