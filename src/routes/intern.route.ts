import { FastifyInstance } from "fastify";
import * as internController from "../controllers/intern.controller";
import { CreateInternBody, UpdateInternBody } from "../schemaValidation/intern.schema";

export default async function internRoutes(fastify: FastifyInstance) {
  fastify.get("/", internController.getInternList);
  
  fastify.get("/:id", internController.getInternById);

  fastify.post(
    "/",
    {
      schema: {
        body: CreateInternBody,
      },
    },
    internController.createIntern
  );

  fastify.put(
    "/:id",
    {
      schema: {
        body: UpdateInternBody,
      },
    },
    internController.updateIntern
  );

  fastify.delete("/:id", internController.deleteIntern);
}
