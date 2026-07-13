import { FastifyRequest, FastifyReply } from "fastify";
import eventsModel from "../models/events.model";
import { CreateEventsType, UpdateEventsType } from "../schemaValidation/events.schema";

export const getEventsList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await eventsModel.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      cover_image: item.cover_image
    }));
    reply.send({ data: formattedData });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getEventsById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await eventsModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    item.cover_image = item.cover_image;
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getEventsBySlug = async (
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await eventsModel.getBySlug(req.params.slug, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    item.cover_image = item.cover_image;
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createEvents = async (
  req: FastifyRequest<{ Body: CreateEventsType }>,
  reply: FastifyReply
) => {
  try {
    const result = await eventsModel.insert(req.body, req.lang);
    const item = result.rows[0];
    item.cover_image = item.cover_image;
    reply.send({ message: "Created successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateEvents = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateEventsType }>,
  reply: FastifyReply
) => {
  try {
    const result = await eventsModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    item.cover_image = item.cover_image;
    reply.send({ message: "Updated successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteEvents = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await eventsModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
