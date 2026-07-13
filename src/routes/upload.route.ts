import path from "path";
import fs from "fs";
import { FastifyInstance } from "fastify";
import envConfig from "../config";
import processUploadPath from "../middlewares/processUploadPath";

export default async function uploadRoutes(server: FastifyInstance) {
  server.post(
    "/*",
    { preHandler: [processUploadPath] },
    async (request, reply) => {
      try {
        const data = await request.file();
        if (!data) {
          return reply.code(400).send({ message: "Không tìm thấy file nào!" });
        }

        const uploadDir = (request as any).path.fullPath;
        
        const ext = path.extname(data.filename) || '.jpg';
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await new Promise((resolve, reject) => {
          const writeStream = fs.createWriteStream(filePath);
          data.file.pipe(writeStream);
          data.file.on("end", resolve);
          writeStream.on("error", reject);
        });

        const rawPath = request.url.split("/upload")[1];
        
        // Return dynamic relative URL
        const normalizePath = (rawPath === "/" || !rawPath ? "" : rawPath) + "/" + fileName;
        const fileUrl = `${envConfig.MEDIA_UPLOAD_FOLDER}/images${normalizePath}`;
        return { url: fileUrl };
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({ message: "Upload failed" });
      }
    }
  );
}
