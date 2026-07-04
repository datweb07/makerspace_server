import { FastifyInstance } from "fastify";
import z from "zod";
import {
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller";
import { CreateStaffBody, UpdateStaffBody } from "../schemaValidation/staff.schema";

async function staffRoute(server: FastifyInstance) {
  server.get("/", getStaffList);

  server.get(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    getStaffById
  );

  server.post(
    "/",
    {
      schema: {
        body: CreateStaffBody,
      },
    },
    createStaff
  );

  server.put(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: UpdateStaffBody,
      },
    },
    updateStaff
  );

  server.delete(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    deleteStaff
  );
}

export default staffRoute;
