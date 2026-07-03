import { type FastifyPluginAsync } from "fastify";
import { contactsController } from "../controllers/contacts.controller";
import { contactInquirySchema, type ContactInquiryInput } from "../schemaValidation/contacts.schema";

const contactsRoute: FastifyPluginAsync = async (server) => {
  server.get("/info", async () => contactsController.getContactDetails());
  server.get("/inquiries", async () => contactsController.listInquiries());

  server.post(
    "/inquiries",
    {
      schema: {
        body: contactInquirySchema,
      },
    },
    async (request) => contactsController.createInquiry(request.body as ContactInquiryInput),
  );
};

export default contactsRoute;
