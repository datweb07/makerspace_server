import { type FastifyPluginAsync } from "fastify";
import { contactsController } from "../controllers/contacts.controller";
import { contactInquirySchema, type ContactInquiryInput } from "../schemaValidation/contacts.schema";
import { requireAdmin } from "../middlewares/auth";

const contactsRoute: FastifyPluginAsync = async (server) => {
  server.get("/info", async () => contactsController.getContactDetails());
  server.get("/inquiries", { preHandler: [requireAdmin] }, async () => contactsController.listInquiries());

  server.post(
    "/inquiries",
    {
      schema: {
        body: contactInquirySchema,
      },
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request) => contactsController.createInquiry(request.body as ContactInquiryInput),
  );
};

export default contactsRoute;
