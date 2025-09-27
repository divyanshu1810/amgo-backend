import { Asset, Job, Project } from "../models";
import { JobStatus } from "../models/Job";
import { renderVideo } from "../services/renderService";
import logger from "../utils/logger";
import { queueService } from "./Index";

export interface RenderJobData {
  jobId: string;
  projectId: number;
}

export class RenderWorker {
  async start(): Promise<void> {
    await queueService.connect();

    await queueService.consumeJobs(async (jobData: Record<string, any>) => {
      await this.processRenderJob(jobData as RenderJobData);
    });
  }

  private async processRenderJob(jobData: RenderJobData): Promise<void> {
    const { jobId, projectId } = jobData;

    logger.info(`Processing render job: ${jobId} for project: ${projectId}`);

    try {
      // Update job status to processing
      const job = await Job.findByPk(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      await job.update({
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        progress: 0,
      });

      // Get project and assets
      const project = await Project.findByPk(projectId, {
        include: [
          {
            model: Asset,
            as: "assets",
          },
        ],
      });

      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      // Simulate progress updates
      for (let progress = 10; progress <= 90; progress += 20) {
        await job.update({ progress });
        await this.delay(1000); // Simulate processing time
      }

      // Render the video
      const outputPath = await renderVideo(project.toJSON(), job.toJSON());

      // Update job as completed
      await job.update({
        status: JobStatus.DONE,
        progress: 100,
        outputPath,
        completedAt: new Date(),
      });

      logger.info(`Render job completed: ${jobId}`);
    } catch (error: any) {
      logger.error(`Render job failed: ${jobId}`, error);

      await Job.update(
        {
          status: JobStatus.FAILED,
          error: error.message,
          completedAt: new Date(),
        },
        {
          where: { id: jobId },
        }
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
