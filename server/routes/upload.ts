import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { S3Client } from "bun";
import { requireAdmin } from "../auth";
import { db } from "../db";

const {
  MINIO_PUBLIC_ENDPOINT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
} = process.env;

if (!MINIO_PUBLIC_ENDPOINT || !MINIO_BUCKET) {
  throw new Error(
    "MINIO_PUBLIC_ENDPOINT and MINIO_BUCKET environment variables are required"
  );
}

if (!MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
  throw new Error(
    "MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables are required"
  );
}

const s3 = new S3Client({
  endpoint: MINIO_PUBLIC_ENDPOINT,
  accessKeyId: MINIO_ACCESS_KEY,
  secretAccessKey: MINIO_SECRET_KEY,
  bucket: MINIO_BUCKET,
  region: "us-east-1",
});

const publicBase = MINIO_PUBLIC_ENDPOINT.replace(/\/$/, "");

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
        expiresIn: PRESIGN_EXPIRES_IN,
      });

      // Permanent public URL — works once the bucket policy allows anonymous GET
      const publicUrl = `${publicBase}/${MINIO_BUCKET}/${key}`;

      return { uploadUrl, publicUrl };
    }
  );
}
