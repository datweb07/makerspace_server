import { type FastifyPluginAsync } from "fastify";
import { workshopsController } from "../controllers/workshops.controller";
import { createWorkshopRegistrationSchema, listWorkshopsQuerySchema, workshopIdParamsSchema, updateBookingStatusSchema, type CreateWorkshopRegistrationInput, type ListWorkshopsQuery, type UpdateBookingStatusInput } from "../schemaValidation/workshops.schema";

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

  server.get("/registrations", async (request) => workshopsController.listRegistrations(request.lang));

  server.get("/registrations/export", async (request, reply) => {
    const buffer = await workshopsController.exportBookingsExcel(request.lang);
    
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', 'attachment; filename="workshop_bookings.xlsx"');
    return reply.send(buffer);
  });

  server.patch(
    "/registrations/:id/status",
    {
      schema: {
        body: updateBookingStatusSchema,
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as UpdateBookingStatusInput;
      return workshopsController.updateBookingStatus(id, body, request.lang);
    }
  );

  server.delete(
    "/registrations/:id",
    async (request) => {
      const { id } = request.params as { id: string };
      return workshopsController.deleteRegistration(id, request.lang);
    }
  );
};

export default workshopsRoute;
