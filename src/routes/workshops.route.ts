import { type FastifyPluginAsync } from "fastify";
import { workshopsController } from "../controllers/workshops.controller";
import { createWorkshopRegistrationSchema, listWorkshopsQuerySchema, workshopIdParamsSchema, updateBookingStatusSchema, type CreateWorkshopRegistrationInput, type ListWorkshopsQuery, type UpdateBookingStatusInput } from "../schemaValidation/workshops.schema";
import { AccountModel } from "../models/account.model";

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

  server.get("/registrations/me", async (request, reply) => {
    const sessionToken = request.headers.authorization || "";
    if (!sessionToken) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    try {
      const { verifySessionToken } = require("../utils/jwt");
      const decoded = verifySessionToken(sessionToken) as any;
      if (!decoded || !decoded.username) {
        return reply.status(401).send({ message: "Invalid session token" });
      }

      // Fetch real email using AccountModel
      const accountModel = new AccountModel();
      let account = await accountModel.findGuestByUsername(decoded.username, request.lang);
      if (!account) {
        account = await accountModel.findMemberByEmail(decoded.username, request.lang);
      }
      
      const email = account?.email || account?.username;
      
      if (!account || !email) {
        return reply.status(404).send({ message: "Account or email not found" });
      }

      return workshopsController.listMyRegistrations(email, request.lang);
    } catch (err) {
      console.error(err);
      return reply.status(401).send({ message: "Error authorizing" });
    }
  });

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
