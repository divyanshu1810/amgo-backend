import { Analytics } from "./Analytics";
import { Asset } from "./Asset";
import { Job } from "./Job";
import { Project } from "./Project";
import { User } from "./User";

User.hasMany(Project, { foreignKey: "userId", as: "projects" });
Project.belongsTo(User, { foreignKey: "userId", as: "user" });

Project.hasMany(Asset, { foreignKey: "projectId", as: "assets" });
Asset.belongsTo(Project, { foreignKey: "projectId", as: "project" });

Project.hasMany(Job, { foreignKey: "projectId", as: "jobs" });
Job.belongsTo(Project, { foreignKey: "projectId", as: "project" });

Project.hasMany(Analytics, { foreignKey: "projectId", as: "analytics" });
Analytics.belongsTo(Project, { foreignKey: "projectId", as: "project" });

export { Analytics, Asset, Job, Project, User };
