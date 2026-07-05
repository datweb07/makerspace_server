import { FastifyInstance } from "fastify";
import {
  getProjectsList,
  getProjectsById,
  getProjectsBySlug,
  createProjects,
  updateProjects,
  deleteProjects,
} from "../controllers/projects.controller";
import { CreateProjectsBody, UpdateProjectsBody } from "../schemaValidation/projects.schema";

export default async function projectsRoutes(fastify: FastifyInstance) {
  fastify.get("/", getProjectsList);
  fastify.get("/slug/:slug", getProjectsBySlug);
  fastify.get("/:id", getProjectsById);
  fastify.post(
    "/",
    {
      schema: {
        body: CreateProjectsBody,
      },
    },
    createProjects
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: UpdateProjectsBody,
      },
    },
    updateProjects
  );
  fastify.delete("/:id", deleteProjects);
}
