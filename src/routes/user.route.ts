import { FastifyInstance } from "fastify";
import { loginUser } from "../controllers/user.controller";
import { LoginBody, LoginBodyType, LoginRes, LoginResType } from "../schemaValidation/auth.schema";
import { verifySessionToken } from "../utils/jwt";

async function usersRoute(server: FastifyInstance) {
  server.post<{
    Reply: { 200: LoginResType; 500: { message: string }; 401: { message: string }; 403: { message: string }; 404: { message: string } };
    Body: LoginBodyType;
  }>(
    "/login",
    {
      schema: {
        body: LoginBody,
        response: {
          200: LoginRes,
        },
      },
    },
    loginUser
  );

  server.post("/checked-valid-session", async (request, reply) => {
    const sessionToken = request.headers.authorization || "";

    if (!sessionToken) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    try {
      const decode = verifySessionToken(sessionToken);

      reply.status(200).send({
        message: "Session is valid",
        token: sessionToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.log("Token validation error:", error);
      reply.status(401).send({ message: "Error on Authorizing" });
    }
  });
}

export default usersRoute;
