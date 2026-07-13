import { FastifyInstance } from "fastify";
import z from "zod";
import {
  getTechnicalsList,
  getTechnicalsById,
  createTechnicals,
  updateTechnicals,
  deleteTechnicals,
} from "../controllers/technicals.controller";
import { CreateTechnicalsBody, UpdateTechnicalsBody } from "../schemaValidation/technicals.schema";

async function technicalsRoute(server: FastifyInstance) {
  server.get("/", getTechnicalsList);

  server.get(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    getTechnicalsById
  );

  server.post(
    "/",
    {
      schema: {
        body: CreateTechnicalsBody,
      },
    },
    createTechnicals
  );

  server.put(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: UpdateTechnicalsBody,
      },
    },
    updateTechnicals
  );

  server.delete(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    deleteTechnicals
  );
}

export default technicalsRoute;
