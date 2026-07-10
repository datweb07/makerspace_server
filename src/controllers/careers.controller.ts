import { FastifyRequest, FastifyReply } from "fastify";
import careersModel from "../models/careers.model";
import { CreateCareersType, UpdateCareersType, CreateCareersSchema, UpdateCareersSchema } from "../schemaValidation/careers.schema";

export const getCareersList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await careersModel.getAll(req.lang);
    reply.send({ data: result.rows });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getCareersById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await careersModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getCareersBySlug = async (
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await careersModel.getBySlug(req.params.slug, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createCareers = async (
  req: FastifyRequest<{ Body: CreateCareersType }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = CreateCareersSchema.parse(req.body);
    const result = await careersModel.insert(validatedData, req.lang);
    reply.send({ message: "Created successfully", data: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return reply.status(400).send({ message: "Validation error", errors: error.errors });
    }
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateCareers = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateCareersType }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = UpdateCareersSchema.parse(req.body);
    const result = await careersModel.update(req.params.id, validatedData, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Updated successfully", data: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return reply.status(400).send({ message: "Validation error", errors: error.errors });
    }
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteCareers = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await careersModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
