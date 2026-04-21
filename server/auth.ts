import type { FastifyReply, FastifyRequest } from "fastify";

const defaultToken = process.env.NODE_ENV === "production" ? undefined : "admin";

export function isAdminRequest(request: FastifyRequest) {
  const expected = process.env.ADMIN_TOKEN ?? defaultToken;
  if (!expected) return false;
  return request.headers["x-admin-token"] === expected;
}

export function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (isAdminRequest(request)) return true;
  reply.code(401).send({ message: "Admin access required" });
  return false;
}
