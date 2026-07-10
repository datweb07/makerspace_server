import { FastifyInstance } from "fastify";
import {
  getStudentLifeList,
  getStudentLifeById,
  getStudentLifeBySlug,
  createStudentLife,
  updateStudentLife,
  deleteStudentLife,
} from "../controllers/student_life.controller";
import { CreateStudentLifeBody, UpdateStudentLifeBody } from "../schemaValidation/student_life.schema";

export default async function studentLifeRoutes(fastify: FastifyInstance) {
  fastify.get("/", getStudentLifeList);
  fastify.get("/slug/:slug", getStudentLifeBySlug);
  fastify.get("/:id", getStudentLifeById);
  fastify.post(
    "/",
    {
      schema: {
        body: CreateStudentLifeBody,
      },
    },
    createStudentLife
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: UpdateStudentLifeBody,
      },
    },
    updateStudentLife
  );
  fastify.delete("/:id", deleteStudentLife);
}
