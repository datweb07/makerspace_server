import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model";
import { signSessionToken } from "../utils/jwt";
import { LoginBodyType } from "../schemaValidation/auth.schema";

export async function loginUser(
  request: FastifyRequest<{ Body: LoginBodyType }>,
  reply: FastifyReply
) {
  try {
    const { username, password } = request.body;
    
    // Hardcode an initialization for the "admin" account if it doesn't exist
    // so the user can login immediately.
    const userModel = new UserModel();
    
    let user = await userModel.findUserByUsername(username, request.lang);
    
    if (!user && username === "admin") {
      // Seed default admin
      const hashed = await bcrypt.hash("123456", 10);
      user = await userModel.createAdminUser(hashed, request.lang);
    }

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid password" });
    }

    if (user.status !== "active") {
      return reply.status(403).send({ message: "Account is disabled" });
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = signSessionToken(tokenPayload);
    // 7 days from now
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return reply.status(200).send({
      message: "Login successful",
      data: {
        token,
        expires,
      },
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
