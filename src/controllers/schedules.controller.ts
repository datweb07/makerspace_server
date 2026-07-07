import { FastifyRequest, FastifyReply } from "fastify";
import schedulesModel from "../models/schedules.model";
import { CreateScheduleType, UpdateScheduleType } from "../schemaValidation/workshops.schema";

export const getSchedulesList = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await schedulesModel.getAll(req.lang);
    reply.send({ data: result.rows });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getScheduleById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await schedulesModel.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const createSchedule = async (
  req: FastifyRequest<{ Body: CreateScheduleType }>,
  reply: FastifyReply
) => {
  try {
    const result = await schedulesModel.insert(req.body, req.lang);
    reply.send({ message: "Created successfully", data: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateSchedule = async (
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateScheduleType }>,
  reply: FastifyReply
) => {
  try {
    const result = await schedulesModel.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Updated successfully", data: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const deleteSchedule = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await schedulesModel.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
