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
      // schema: { body: CreateCareersSchema } // using Zod, usually requires a plugin, or manual parse in controller. I'll rely on controller parsing.
    },
    createCareers
  );
  fastify.put(
    "/:id",
    {
      // schema: { body: UpdateCareersSchema }
    },
    updateCareers
  );
  fastify.delete("/:id", deleteCareers);
}
