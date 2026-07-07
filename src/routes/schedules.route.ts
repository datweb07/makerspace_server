import { FastifyInstance } from "fastify";
import {
  getSchedulesList,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedules.controller";
import { createScheduleSchema, updateScheduleSchema } from "../schemaValidation/workshops.schema";

export default async function schedulesRoutes(fastify: FastifyInstance) {
  fastify.get("/", getSchedulesList);
  fastify.get("/:id", getScheduleById);
  fastify.post(
    "/",
    {
      schema: {
        body: createScheduleSchema,
      },
    },
    createSchedule
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: updateScheduleSchema,
      },
    },
    updateSchedule
  );
  fastify.delete("/:id", deleteSchedule);
}
