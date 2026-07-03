import { type FastifyPluginAsync } from "fastify";
import { servicesController } from "../controllers/services.controller";
import { serviceQuoteRequestSchema, type ServiceQuoteRequestInput } from "../schemaValidation/services.schema";

const servicesRoute: FastifyPluginAsync = async (server) => {
  server.get("/catalog", async () => servicesController.listCatalog());
  server.get("/quote-requests", async () => servicesController.listQuoteRequests());

  server.post(
    "/quote-requests",
    {
      schema: {
        body: serviceQuoteRequestSchema,
      },
    },
    async (request) => servicesController.createQuoteRequest(request.body as ServiceQuoteRequestInput),
  );
};

export default servicesRoute;
