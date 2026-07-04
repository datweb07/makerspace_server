import path from "path";
import fs from "fs";
import { FastifyInstance } from "fastify";
import envConfig from "../config";

export default async function uploadRoutes(server: FastifyInstance) {
  server.post("/", async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ message: "Không tìm thấy file nào!" });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(data.filename) || '.jpg';
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        data.file.pipe(writeStream);
        data.file.on("end", resolve);
        writeStream.on("error", reject);
      });

      // The frontend URL would be something like http://localhost:5000/public/uploads/xxx.jpg
      const fileUrl = `${envConfig.SERVER_PROTOCOL}://${envConfig.SERVER_DOMAIN}/public/uploads/${fileName}`;
      return { url: fileUrl };
    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({ message: "Upload failed" });
    }
  });
}
