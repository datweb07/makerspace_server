import path from "path";
import fs from "fs";
import { FastifyInstance } from "fastify";
import envConfig from "../config";
import processUploadPath from "../middlewares/processUploadPath";
import { requireAuth } from "../middlewares/auth";

// Whitelist các extension được phép upload
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

export default async function uploadRoutes(server: FastifyInstance) {
  server.post(
    "/*",
    { preHandler: [requireAuth, processUploadPath] },
    async (request, reply) => {
      try {
        const data = await request.file();
        if (!data) {
          return reply.code(400).send({ message: "Không tìm thấy file nào!" });
        }

        // Kiểm tra extension hợp lệ
        const ext = path.extname(data.filename).toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
          // Drain stream để tránh memory leak
          data.file.resume();
          return reply.code(400).send({
            message: `Loại file không được phép. Chỉ chấp nhận: ${[...ALLOWED_EXTENSIONS].join(", ")}`,
          });
        }

        // Kiểm tra mimetype (lớp bảo vệ thứ 2)
        const allowedMimetypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!allowedMimetypes.includes(data.mimetype)) {
          data.file.resume();
          return reply.code(400).send({ message: "MIME type không được phép" });
        }

        const uploadDir = (request as any).path.fullPath;
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await new Promise((resolve, reject) => {
          const writeStream = fs.createWriteStream(filePath);
          data.file.pipe(writeStream);
          data.file.on("end", resolve);
          writeStream.on("error", reject);
        });

        const rawPath = request.url.split("/upload")[1];
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
