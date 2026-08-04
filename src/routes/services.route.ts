import { type FastifyPluginAsync } from "fastify";
import { servicesController } from "../controllers/services.controller";
import { serviceQuoteRequestSchema, type ServiceQuoteRequestInput } from "../schemaValidation/services.schema";

const servicesRoute: FastifyPluginAsync = async (server) => {
  server.get("/catalog", async () => servicesController.listCatalog());
  server.get("/quote-requests", async (request) => {
    const lang = (request.headers["x-custom-lang"] as string) || "vi";
    return servicesController.listQuoteRequests(lang);
  });

  server.post(
    "/quote-requests",
    {
      schema: {
        body: serviceQuoteRequestSchema,
      },
    },
    async (request) => {
      const lang = (request.headers["x-custom-lang"] as string) || "vi";
      return servicesController.createQuoteRequest(request.body as ServiceQuoteRequestInput, lang);
    }
  );

  server.delete("/quote-requests/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await servicesController.deleteQuoteRequest(id);
    reply.status(200).send({ message: "Deleted successfully" });
  });
};

export default servicesRoute;
