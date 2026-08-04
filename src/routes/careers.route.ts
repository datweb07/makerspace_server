import { FastifyInstance } from "fastify";
import {
  getCareersList,
  getCareersById,
  getCareersBySlug,
  createCareers,
  updateCareers,
  deleteCareers,
} from "../controllers/careers.controller";
import { CreateCareersSchema, UpdateCareersSchema } from "../schemaValidation/careers.schema";

export default async function careersRoutes(fastify: FastifyInstance) {
  fastify.get("/", getCareersList);
  fastify.get("/slug/:slug", getCareersBySlug);
  fastify.get("/:id", getCareersById);
  fastify.post(
    "/",
    {

    },
    createCareers
  );
  fastify.put(
    "/:id",
    {

    },
    updateCareers
  );
  fastify.delete("/:id", deleteCareers);
}
