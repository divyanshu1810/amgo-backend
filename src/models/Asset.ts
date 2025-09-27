import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { Project } from "./Project";

interface AssetAttributes {
  id: number;
  projectId: number;
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AssetCreationAttributes extends Optional<AssetAttributes, "id"> {}

export class Asset extends Model<AssetAttributes, AssetCreationAttributes> implements AssetAttributes {
  public id!: number;
  public projectId!: number;
  public filename!: string;
  public originalName!: string;
  public path!: string;
  public mimeType!: string;
  public size!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Asset.init(
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
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Asset",
    tableName: "assets",
  }
);
