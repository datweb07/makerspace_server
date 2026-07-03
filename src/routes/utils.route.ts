import { type FastifyPluginAsync } from "fastify";
import { utilsController } from "../controllers/utils.controller";

const utilsRoute: FastifyPluginAsync = async (server) => {
  server.get("/health", async () => utilsController.health());
  server.get("/meta", async () => ({
    name: "makerspace_server",
    version: "1.0.0",
  }));
};

export default utilsRoute;
