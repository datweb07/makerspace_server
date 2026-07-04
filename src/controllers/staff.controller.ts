import { FastifyRequest, FastifyReply } from "fastify";
import staffModel from "../models/staff.model";
import { CreateStaffType, UpdateStaffType } from "../schemaValidation/staff.schema";
import { formatImageUrl } from "../utils/formatImageUrl";

export const getStaffList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await staffModel.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      image: formatImageUrl(item.cover_image), // Keep image alias if frontend expects it
      cover_image: formatImageUrl(item.cover_image)
    }));
    reply.send({ data: formattedData });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getStaffById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await staffModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Staff not found" });
    }
    const staff = result.rows[0];
    staff.image = formatImageUrl(staff.cover_image);
    staff.cover_image = formatImageUrl(staff.cover_image);
    reply.send({ data: staff });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createStaff = async (
  req: FastifyRequest<{ Body: CreateStaffType }>,
  reply: FastifyReply
) => {
  try {
    const result = await staffModel.insert(req.body, req.lang);
    const staff = result.rows[0];
    staff.image = formatImageUrl(staff.cover_image);
    staff.cover_image = formatImageUrl(staff.cover_image);
    reply.send({ message: "Created successfully", data: staff });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateStaff = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateStaffType }>,
  reply: FastifyReply
) => {
  try {
    const result = await staffModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Staff not found" });
    }
    const staff = result.rows[0];
    staff.image = formatImageUrl(staff.cover_image);
    staff.cover_image = formatImageUrl(staff.cover_image);
    reply.send({ message: "Updated successfully", data: staff });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteStaff = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await staffModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Staff not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
