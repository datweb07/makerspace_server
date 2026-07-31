import { FastifyRequest, FastifyReply } from "fastify";
import internModel from "../models/intern.model";
import { CreateInternType, UpdateInternType } from "../schemaValidation/intern.schema";

export const getInternList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await internModel.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      image: item.cover_image, // Keep image alias if frontend expects it
      cover_image: item.cover_image
    }));
    reply.send({ data: formattedData });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getInternById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await internModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Intern not found" });
    }
    const intern = result.rows[0];
    intern.image = intern.cover_image;
    intern.cover_image = intern.cover_image;
    reply.send({ data: intern });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createIntern = async (
  req: FastifyRequest<{ Body: CreateInternType }>,
  reply: FastifyReply
) => {
  try {
    const result = await internModel.insert(req.body, req.lang);
    const intern = result.rows[0];
    intern.image = intern.cover_image;
    intern.cover_image = intern.cover_image;
    reply.send({ message: "Created successfully", data: intern });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateIntern = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateInternType }>,
  reply: FastifyReply
) => {
  try {
    const oldInternRes = await internModel.getById(req.params.id, req.lang);

    const result = await internModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Intern not found" });
    }
    const intern = result.rows[0];

    if (oldInternRes.rows.length > 0) {
      const oldImage = oldInternRes.rows[0].cover_image;
      if (oldImage && oldImage !== intern.cover_image) {
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
    intern.image = intern.cover_image;
    intern.cover_image = intern.cover_image;
    reply.send({ message: "Updated successfully", data: intern });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteIntern = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await internModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Intern not found" });
    }

    const intern = result.rows[0];
    if (intern.cover_image) {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(process.cwd(), intern.cover_image);
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
