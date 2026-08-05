import fs from "fs";
import path from "path";
import { FastifyRequest } from "fastify";
import envConfig from "../config";

export default async function processUploadPath(request: FastifyRequest) {
  const baseDir = path.resolve(
    process.cwd(),
    envConfig.MEDIA_UPLOAD_FOLDER,
    "images",
  );

  const rawPath = request.url.split("?")[0];

  const resolvedPath = path.resolve(baseDir, "." + rawPath);

  if (rawPath.includes("..")) {
    throw new Error("Path traversal detected");
  }

  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error("Invalid directory path");
  }

  try {
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }
  } catch (err) {
    console.error(err);
  }

  (request as any).path = { fullPath: resolvedPath, isDir: true };
}
