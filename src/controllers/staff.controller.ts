import { FastifyRequest, FastifyReply } from "fastify";
import staffModel from "../models/staff.model";
import { CreateStaffType, UpdateStaffType } from "../schemaValidation/staff.schema";

export const getStaffList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await staffModel.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      image: item.cover_image, 
      cover_image: item.cover_image
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
    staff.image = staff.cover_image;
    staff.cover_image = staff.cover_image;
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
    staff.image = staff.cover_image;
    staff.cover_image = staff.cover_image;
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
    const oldStaffRes = await staffModel.getById(req.params.id, req.lang);
    
    const result = await staffModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Staff not found" });
    }
    const staff = result.rows[0];

    if (oldStaffRes.rows.length > 0) {
      const oldImage = oldStaffRes.rows[0].cover_image;
      if (oldImage && oldImage !== staff.cover_image) {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(process.cwd(), oldImage);
        fs.unlink(filePath, (err: any) => {
          if (err && err.code !== "ENOENT") {
            console.error("Failed to delete old image file:", err);
          }
        });
      }
    }
    staff.image = staff.cover_image;
    staff.cover_image = staff.cover_image;
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

    const staff = result.rows[0];
    if (staff.cover_image) {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(process.cwd(), staff.cover_image);
      fs.unlink(filePath, (err: any) => {
        if (err && err.code !== "ENOENT") {
          console.error("Failed to delete image file:", err);
        }
      });
    }

    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
