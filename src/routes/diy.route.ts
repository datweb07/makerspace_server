import { FastifyInstance } from "fastify";
import {
  getDiyList,
  getDiyById,
  createDiy,
  updateDiy,
  deleteDiy,
  getDiyBySlug,
} from "../controllers/diy.controller";
import { createDiySchema, updateDiySchema } from "../schemaValidation/workshops.schema";

export default async function diyRoutes(fastify: FastifyInstance) {
  fastify.get("/", getDiyList);
  fastify.get("/:id", getDiyById);
  fastify.get("/slug/:slug", getDiyBySlug);
  fastify.post(
    "/",
    {
      schema: {
        body: createDiySchema,
      },
    },
    createDiy
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: updateDiySchema,
      },
    },
    updateDiy
  );
  fastify.delete("/:id", deleteDiy);
}
