import { FastifyRequest, FastifyReply } from "fastify";
import { verifySessionToken } from "../utils/jwt";

/**
 * Middleware: Yêu cầu người dùng phải có JWT hợp lệ (bất kỳ role nào)
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization;
  if (!token) {
    return reply.status(401).send({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = verifySessionToken(token) as any;
    (request as any).user = decoded;
  } catch {
    return reply.status(401).send({ message: "Unauthorized: Invalid or expired token" });
  }
}

/**
 * Middleware: Yêu cầu người dùng phải có role = "admin"
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization;
  if (!token) {
    return reply.status(401).send({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = verifySessionToken(token) as any;
    if (decoded.role !== "admin") {
      return reply.status(403).send({ message: "Forbidden: Admin access required" });
    }
    (request as any).user = decoded;
  } catch {
    return reply.status(401).send({ message: "Unauthorized: Invalid or expired token" });
  }
}
