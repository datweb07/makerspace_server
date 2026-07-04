import { FastifyInstance } from "fastify";
import {
  getNewsList,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/news.controller";
import { CreateNewsBody, UpdateNewsBody } from "../schemaValidation/news.schema";

export default async function newsRoutes(fastify: FastifyInstance) {
  fastify.get("/", getNewsList);
  fastify.get("/slug/:slug", getNewsBySlug);
  fastify.get("/:id", getNewsById);
  fastify.post(
    "/",
    {
      schema: {
        body: CreateNewsBody,
      },
    },
    createNews
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: UpdateNewsBody,
      },
    },
    updateNews
  );
  fastify.delete("/:id", deleteNews);
}
