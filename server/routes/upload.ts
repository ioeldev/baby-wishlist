import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { s3 } from "bun";
import { requireAdmin } from "../auth";
import { db } from "../db";

const {
  S3_ENDPOINT,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_PUBLIC_BASE_URL,
} = process.env;

if (!S3_ENDPOINT || !S3_BUCKET) {
  throw new Error(
    "S3_ENDPOINT and S3_BUCKET environment variables are required"
  );
}

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
  throw new Error(
    "S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables are required"
  );
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PRESIGN_EXPIRES_IN = 15 * 60; // 15 minutes

export async function uploadRoutes(app: FastifyInstance) {
  app.post<{ Params: { itemId: number } }>(
    "/items/:itemId/upload-fallback/presign",
    async (request, reply) => {
      if (!requireAdmin(request, reply)) return;

      const params = z
        .object({ itemId: z.coerce.number().int().positive() })
        .parse(request.params);

      const body = z
        .object({
          contentType: z.string(),
          contentLength: z.number().int().positive(),
          filename: z.string().min(1),
        })
        .parse(request.body);

      if (!ALLOWED_MIME_TYPES.includes(body.contentType)) {
        return reply.code(400).send({
          message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        });
      }

      if (body.contentLength > MAX_FILE_SIZE) {
        return reply.code(400).send({
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        });
      }

      const item = db.query("SELECT id FROM items WHERE id = ?").get(params.itemId);
      if (!item) {
        return reply.code(404).send({ message: "Item not found" });
      }

      const ext = body.filename.split(".").pop() ?? "bin";
      const key = `fallback-${params.itemId}-${Date.now()}.${ext}`;

      const uploadUrl = s3.presign(key, {
        method: "PUT",
        type: body.contentType,
        acl: "public-read",
        expiresIn: PRESIGN_EXPIRES_IN,
      });

      const publicBaseUrl = (S3_PUBLIC_BASE_URL || S3_ENDPOINT!).replace(/\/$/, "");
      const publicUrl = `${publicBaseUrl}/${S3_BUCKET}/${key}`;

      return { uploadUrl, publicUrl };
    }
  );
}
