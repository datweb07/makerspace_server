import { FastifyInstance } from "fastify";
import {
  createShortCourse,
  deleteShortCourse,
  getShortCourseById,
  getShortCoursesList,
  updateShortCourse,
  getShortCourseBySlug,
} from "../controllers/short_courses.controller";
import { createShortCourseSchema, updateShortCourseSchema } from "../schemaValidation/workshops.schema";

export default async function shortCoursesRoutes(fastify: FastifyInstance) {
  fastify.get("/", getShortCoursesList);
  fastify.get("/:id", getShortCourseById);
  fastify.get("/slug/:slug", getShortCourseBySlug);
  fastify.post(
    "/",
    {
      schema: {
        body: createShortCourseSchema,
      },
    },
    createShortCourse
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: updateShortCourseSchema,
      },
    },
    updateShortCourse
  );
  fastify.delete("/:id", deleteShortCourse);
}
