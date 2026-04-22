import type { FastifyInstance } from "fastify";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "../auth";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadRoutes(app: FastifyInstance) {
  app.post<{ Params: { itemId: number } }>(
    "/items/:itemId/upload-fallback",
    async (request, reply) => {
      if (!requireAdmin(request, reply)) return;

      const { itemId } = request.params as { itemId: number };
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ message: "No file provided" });
      }

      const buffer = await data.toBuffer();
      const fileName = `fallback-${itemId}-${Date.now()}-${data.filename}`;

      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET || "",
            Key: fileName,
            Body: buffer,
            ContentType: data.mimetype,
          })
        );

        const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileName}`;
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
