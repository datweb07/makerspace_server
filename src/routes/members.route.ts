import { type FastifyPluginAsync } from "fastify";
import { membersController } from "../controllers/members.controller";
import { memberRegistrationSchema, type MemberRegistrationInput } from "../schemaValidation/members.schema";

const membersRoute: FastifyPluginAsync = async (server) => {
  server.get("/registrations", async () => membersController.listRegistrations());

  server.post(
    "/registrations",
    {
      schema: {
        body: memberRegistrationSchema,
      },
    },
    async (request) => membersController.createRegistration(request.body as MemberRegistrationInput),
  );
};

export default membersRoute;
