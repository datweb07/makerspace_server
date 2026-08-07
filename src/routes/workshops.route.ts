import { type FastifyPluginAsync } from "fastify";
import { workshopsController } from "../controllers/workshops.controller";
import { createWorkshopRegistrationSchema, listWorkshopsQuerySchema, workshopIdParamsSchema, updateBookingStatusSchema, type CreateWorkshopRegistrationInput, type ListWorkshopsQuery, type UpdateBookingStatusInput } from "../schemaValidation/workshops.schema";
import { AccountModel } from "../models/account.model";
import { requireAdmin } from "../middlewares/auth";

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
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request) => workshopsController.createRegistration(request.body as CreateWorkshopRegistrationInput),
  );

  server.get("/registrations", { preHandler: [requireAdmin] }, async (request) => workshopsController.listRegistrations(request.lang));

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

  server.post("/registrations/find", async (request, reply) => {
    const body = request.body as { email: string; phone: string; workshop_id: string; workshop_type: string };
    const registration = await workshopsController.findRegistration(body.email, body.phone, body.workshop_id, body.workshop_type, request.lang);
    if (!registration) {
      return reply.status(404).send({ message: "Registration not found" });
    }
    return { data: registration };
  });

  server.post("/registrations/absence", async (request, reply) => {
    const body = request.body as { booking_id: string; date: string; reason: string };
    const result = await workshopsController.addAbsenceRequest(body.booking_id, { date: body.date, reason: body.reason }, request.lang);
    return { data: result, message: "Absence request submitted successfully" };
  });

  server.delete("/registrations/absence/:booking_id/:index", { preHandler: [requireAdmin] }, async (request, reply) => {
    const { booking_id, index } = request.params as { booking_id: string; index: string };
    const result = await workshopsController.deleteAbsenceRequest(booking_id, parseInt(index), request.lang);
    return { data: result, message: "Absence request deleted successfully" };
  });

  server.get("/registrations/export", { preHandler: [requireAdmin] }, async (request, reply) => {
    const buffer = await workshopsController.exportBookingsExcel(request.lang);

    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', 'attachment; filename="workshop_bookings.xlsx"');
    return reply.send(buffer);
  });

  server.patch(
    "/registrations/:id/status",
    {
      preHandler: [requireAdmin],
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
    { preHandler: [requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      return workshopsController.deleteRegistration(id, request.lang);
    }
  );
};

export default workshopsRoute;
