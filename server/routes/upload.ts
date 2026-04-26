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

// Strip default ports so the signed host header matches what browsers send
// e.g. https://host:443 → https://host (browsers omit :443 for HTTPS)
function normalizeEndpoint(url: string): string {
  try {
    const u = new URL(url);
    if (
      (u.protocol === "https:" && u.port === "443") ||
      (u.protocol === "http:" && u.port === "80")
    ) {
      u.port = "";
    }
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
}

const endpoint = normalizeEndpoint(MINIO_PUBLIC_ENDPOINT);

const s3 = new S3Client({
  endpoint,
  accessKeyId: MINIO_ACCESS_KEY,
  secretAccessKey: MINIO_SECRET_KEY,
  bucket: MINIO_BUCKET,
  region: "us-east-1",
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PRESIGN_EXPIRES_IN = 15 * 60; // 15 minutes

function getFallbackImageKey(publicUrl: string): string | null {
  try {
    const imageUrl = new URL(publicUrl);
    const endpointUrl = new URL(endpoint);

    if (imageUrl.origin !== endpointUrl.origin) {
      return null;
    }

    const pathParts = imageUrl.pathname.split("/").filter(Boolean);
    if (pathParts[0] !== MINIO_BUCKET || pathParts.length < 2) {
      return null;
    }

    return pathParts.slice(1).map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
}

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

      // Permanent public URL — works once bucket policy allows anonymous GET
      const publicUrl = `${endpoint}/${MINIO_BUCKET}/${key}`;

      return { uploadUrl, publicUrl };
    }
  );

  app.delete<{ Params: { itemId: number } }>(
    "/items/:itemId/fallback-image",
    async (request, reply) => {
      if (!requireAdmin(request, reply)) return;

      const params = z
        .object({ itemId: z.coerce.number().int().positive() })
        .parse(request.params);

      const item = db
        .query("SELECT id, fallback_image FROM items WHERE id = ?")
        .get(params.itemId) as { id: number; fallback_image: string | null } | null;

      if (!item) {
        return reply.code(404).send({ message: "Item not found" });
      }

      if (item.fallback_image) {
        const key = getFallbackImageKey(item.fallback_image);
        if (key) {
          await s3.delete(key);
        }
      }

      const updated = db.query(`
        UPDATE items
        SET fallback_image = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `).get(params.itemId) as Record<string, unknown>;

      return updated;
    }
  );
}
