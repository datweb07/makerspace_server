import { FastifyRequest, FastifyReply } from "fastify";
import technicalsModel from "../models/technicals.model";
import { CreateTechnicalsType, UpdateTechnicalsType } from "../schemaValidation/technicals.schema";

export const getTechnicalsList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await technicalsModel.getAll(req.lang);
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

export const getTechnicalsById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await technicalsModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Technicals not found" });
    }
    const technicals = result.rows[0];
    technicals.image = technicals.cover_image;
    technicals.cover_image = technicals.cover_image;
    reply.send({ data: technicals });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createTechnicals = async (
  req: FastifyRequest<{ Body: CreateTechnicalsType }>,
  reply: FastifyReply
) => {
  try {
    const result = await technicalsModel.insert(req.body, req.lang);
    const technicals = result.rows[0];
    technicals.image = technicals.cover_image;
    technicals.cover_image = technicals.cover_image;
    reply.send({ message: "Created successfully", data: technicals });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateTechnicals = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateTechnicalsType }>,
  reply: FastifyReply
) => {
  try {
    const oldTechnicalsRes = await technicalsModel.getById(req.params.id, req.lang);
    
    const result = await technicalsModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Technicals not found" });
    }
    const technicals = result.rows[0];

    if (oldTechnicalsRes.rows.length > 0) {
      const oldImage = oldTechnicalsRes.rows[0].cover_image;
      if (oldImage && oldImage !== technicals.cover_image) {
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
    technicals.image = technicals.cover_image;
    technicals.cover_image = technicals.cover_image;
    reply.send({ message: "Updated successfully", data: technicals });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteTechnicals = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await technicalsModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Technicals not found" });
    }

    const technicals = result.rows[0];
    if (technicals.cover_image) {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(process.cwd(), technicals.cover_image);
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
