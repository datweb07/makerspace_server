import { FastifyInstance, FastifyPluginOptions, FastifyPluginAsync } from "fastify";
import SearchController from "../controllers/search.controller";

const searchRoute: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
  fastify.get("/", SearchController.globalSearch);
};

export default searchRoute;

