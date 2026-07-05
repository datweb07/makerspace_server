import { FastifyInstance } from "fastify";
import {
  getEventsList,
  getEventsById,
  getEventsBySlug,
  createEvents,
  updateEvents,
  deleteEvents,
} from "../controllers/events.controller";
import { CreateEventsBody, UpdateEventsBody } from "../schemaValidation/events.schema";

export default async function eventsRoutes(fastify: FastifyInstance) {
  fastify.get("/", getEventsList);
  fastify.get("/slug/:slug", getEventsBySlug);
  fastify.get("/:id", getEventsById);
  fastify.post(
    "/",
    {
      schema: {
        body: CreateEventsBody,
      },
    },
    createEvents
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: UpdateEventsBody,
      },
    },
    updateEvents
  );
  fastify.delete("/:id", deleteEvents);
}
