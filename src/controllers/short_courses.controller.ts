import { FastifyRequest, FastifyReply } from "fastify";
import shortCoursesModel from "../models/short_courses.model";
import { CreateShortCourseType, UpdateShortCourseType } from "../schemaValidation/workshops.schema";

export const getShortCoursesList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await shortCoursesModel.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      cover_image: item.cover_image ? item.cover_image : null
    }));
    reply.send({ data: formattedData });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getShortCourseById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await shortCoursesModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = item.cover_image;
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getShortCourseBySlug = async (
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await shortCoursesModel.getBySlug(req.params.slug, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = item.cover_image;
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createShortCourse = async (
  req: FastifyRequest<{ Body: CreateShortCourseType }>,
  reply: FastifyReply
) => {
  try {
    const result = await shortCoursesModel.insert(req.body, req.lang);
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = item.cover_image;
    reply.send({ message: "Created successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateShortCourse = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateShortCourseType }>,
  reply: FastifyReply
) => {
  try {
    const result = await shortCoursesModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    if (item.cover_image) item.cover_image = item.cover_image;
    reply.send({ message: "Updated successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteShortCourse = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await shortCoursesModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
