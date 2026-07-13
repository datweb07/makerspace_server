import { FastifyRequest, FastifyReply } from "fastify";
import studentLifeModel from "../models/student_life.model";
import { CreateStudentLifeType, UpdateStudentLifeType } from "../schemaValidation/student_life.schema";

export const getStudentLifeList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await studentLifeModel.getAll(req.lang);
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

export const getStudentLifeById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await studentLifeModel.getById(req.params.id, req.lang);
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

export const getStudentLifeBySlug = async (
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await studentLifeModel.getBySlug(req.params.slug, req.lang);
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

export const createStudentLife = async (
  req: FastifyRequest<{ Body: CreateStudentLifeType }>,
  reply: FastifyReply
) => {
  try {
    const result = await studentLifeModel.insert(req.body, req.lang);
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

export const updateStudentLife = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateStudentLifeType }>,
  reply: FastifyReply
) => {
  try {
    const result = await studentLifeModel.update(req.params.id, req.body, req.lang);
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

export const deleteStudentLife = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await studentLifeModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
