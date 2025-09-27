import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { Asset, Job } from "../models";
import logger from "../utils/logger";

export async function renderVideo(project: any, job: Job): Promise<string> {
  const outputDir = path.join(process.cwd(), "outputs");
  const outputFilename = `${project.id}_${job.id}_rendered.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Get the first video asset as input (simplified for demo)
  const videoAsset = project.assets?.find((a: Asset) => a.mimeType.startsWith("video/"));

  if (!videoAsset) {
    // If no video, create a simple test video with FFmpeg
    await createTestVideo(outputPath, project.title);
  } else {
    // Process existing video with overlay
    await processVideoWithOverlay(videoAsset.path, outputPath, project.title);
  }

  return outputPath;
}

async function createTestVideo(outputPath: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-f",
      "lavfi",
      "-i",
      `color=c=blue:s=1280x720:d=5`,
      "-vf",
      `drawtext=fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf:text='${text}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`,
      "-codec:a",
      "copy",
      "-y",
      outputPath,
    ];

    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stderr.on("data", (data) => {
      logger.debug(`FFmpeg: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });
  });
}

async function processVideoWithOverlay(inputPath: string, outputPath: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-i",
      inputPath,
      "-vf",
      `drawtext=fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf:text='${text}':fontcolor=white:fontsize=24:x=10:y=10:box=1:boxcolor=black@0.5:boxborderw=5`,
      "-codec:a",
      "copy",
      "-y",
      outputPath,
    ];

    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stderr.on("data", (data) => {
      logger.debug(`FFmpeg: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });
  });
}
