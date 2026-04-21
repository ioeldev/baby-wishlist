import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth";
import { db } from "../db";

const categoryInput = z.object({
  name: z.string().trim().min(1),
  sort_order: z.coerce.number().int().optional().default(0),
});

const categoryPatch = categoryInput.partial().extend({
  name: z.string().trim().min(1).optional(),
});

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/categories", async () => {
    return db.query(`
      SELECT
        c.id,
        c.name,
        c.sort_order,
        COALESCE(SUM(CASE WHEN i.reserved_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS checked_count,
        COALESCE(SUM(CASE WHEN i.reserved_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS reserved_count,
        COUNT(i.id) AS total_count
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `).all();
  });

  app.post("/categories", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const body = categoryInput.parse(request.body);
    const category = db.query("INSERT INTO categories (name, sort_order) VALUES (?, ?) RETURNING *").get(
      body.name,
      body.sort_order,
    );

    return reply.code(201).send(category);
  });

  app.patch("/categories/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = categoryPatch.parse(request.body);
    const existing = db.query("SELECT * FROM categories WHERE id = ?").get(params.id) as
      | { id: number; name: string; sort_order: number }
      | null;

    if (!existing) {
      return reply.code(404).send({ message: "Category not found" });
    }

    const category = db.query("UPDATE categories SET name = ?, sort_order = ? WHERE id = ? RETURNING *").get(
      body.name ?? existing.name,
      body.sort_order ?? existing.sort_order,
      params.id,
    );

    return category;
  });

  app.delete("/categories/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const result = db.query("DELETE FROM categories WHERE id = ? RETURNING id").get(params.id);

    if (!result) {
      return reply.code(404).send({ message: "Category not found" });
    }

    return { ok: true };
  });
}
