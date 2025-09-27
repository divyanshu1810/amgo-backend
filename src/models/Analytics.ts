import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { Project } from "./Project";

export enum EventType {
  PLAY = "play",
  CLICK = "click",
  IMPRESSION = "impression",
  CONVERSION = "conversion",
  ERROR = "error",
}

interface AnalyticsAttributes {
  id: number;
  projectId: number;
  eventType: EventType;
  metadata?: object;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: Date;
}

interface AnalyticsCreationAttributes extends Optional<AnalyticsAttributes, "id" | "metadata" | "userAgent" | "ipAddress"> {}

export class Analytics extends Model<AnalyticsAttributes, AnalyticsCreationAttributes> implements AnalyticsAttributes {
  public id!: number;
  public projectId!: number;
  public eventType!: EventType;
  public metadata?: object;
  public userAgent?: string;
  public ipAddress?: string;
  public readonly createdAt!: Date;
}

Analytics.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: "id",
      },
    },
    eventType: {
      type: DataTypes.ENUM(...Object.values(EventType)),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Analytics",
    tableName: "analytics",
    updatedAt: false,
  }
);
