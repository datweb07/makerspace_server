import { FastifyRequest, FastifyReply } from "fastify";
import diyModel from "../models/diy.model";
import { CreateDiyType, UpdateDiyType } from "../schemaValidation/workshops.schema";
import { formatImageUrl } from "../utils/formatImageUrl";

export const getDiyList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await diyModel.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      cover_image: item.cover_image ? formatImageUrl(item.cover_image) : null
    }));
    reply.send({ data: formattedData });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getDiyById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await diyModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getDiyBySlug = async (
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await diyModel.getBySlug(req.params.slug, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createDiy = async (
  req: FastifyRequest<{ Body: CreateDiyType }>,
  reply: FastifyReply
) => {
  try {
    const result = await diyModel.insert(req.body, req.lang);
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ message: "Created successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateDiy = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateDiyType }>,
  reply: FastifyReply
) => {
  try {
    const result = await diyModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ message: "Updated successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteDiy = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await diyModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
