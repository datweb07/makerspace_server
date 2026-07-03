import { type FastifyPluginAsync } from "fastify";
import { workshopsController } from "../controllers/workshops.controller";
import { createWorkshopRegistrationSchema, listWorkshopsQuerySchema, workshopIdParamsSchema, type CreateWorkshopRegistrationInput, type ListWorkshopsQuery } from "../schemaValidation/workshops.schema";

const workshopsRoute: FastifyPluginAsync = async (server) => {
  server.get(
    "/",
    {
      schema: {
        querystring: listWorkshopsQuerySchema,
      },
    },
    async (request) => workshopsController.listWorkshops(request.query as ListWorkshopsQuery),
  );

  server.get("/featured", async () => workshopsController.listFeaturedWorkshops());

  server.get(
    "/:id",
    {
      schema: {
        params: workshopIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const workshop = workshopsController.listWorkshops().data.find((item) => item.id === Number(params.id));
      if (!workshop) {
        return reply.code(404).send({ message: "Workshop not found" });
      }

      return workshop;
    },
  );

  server.post(
    "/registrations",
    {
      schema: {
        body: createWorkshopRegistrationSchema,
      },
    },
    async (request) => workshopsController.createRegistration(request.body as CreateWorkshopRegistrationInput),
  );

  server.get("/registrations", async () => workshopsController.listRegistrations());
};

export default workshopsRoute;
