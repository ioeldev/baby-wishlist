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

function validateFileUpload(mimetype: string, size: number): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    return `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`;
  }
  if (size > MAX_FILE_SIZE) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  return null;
}

export async function uploadRoutes(app: FastifyInstance) {
  app.post<{ Params: { itemId: number } }>(
    "/items/:itemId/upload-fallback",
    async (request, reply) => {
      if (!requireAdmin(request, reply)) return;

      const params = z.object({ itemId: z.coerce.number().int().positive() }).parse(request.params);

      // Verify item exists
      const item = db.query("SELECT id FROM items WHERE id = ?").get(params.itemId);
      if (!item) {
        return reply.code(404).send({ message: "Item not found" });
      }

      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ message: "No file provided" });
      }

      const buffer = await data.toBuffer();

      // Validate file
      const validationError = validateFileUpload(data.mimetype, buffer.length);
      if (validationError) {
        return reply.code(400).send({ message: validationError });
      }

      const fileName = `fallback-${params.itemId}-${Date.now()}-${data.filename}`;

      try {
        const s3file = s3.file(fileName);
        await s3file.write(buffer, { type: data.mimetype, acl: "public-read" });

        const publicBaseUrl = S3_PUBLIC_BASE_URL || S3_ENDPOINT;
        const fileUrl = `${publicBaseUrl}/${S3_BUCKET}/${fileName}`;

        // Update item with fallback image URL
        db.query(`
          UPDATE items
          SET fallback_image = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(fileUrl, params.itemId);

        return { url: fileUrl };
      } catch (error) {
        console.error("S3 upload error:", error);
        return reply
          .code(500)
          .send({ message: "Failed to upload file to S3" });
      }
    }
  );
}
