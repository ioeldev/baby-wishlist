import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth";
import { db, toBoolean } from "../db";

const itemInput = z.object({
  category_id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1),
  note: z.string().trim().optional().nullable(),
  assigned_to: z.string().trim().optional().nullable(),
  price_estimate: z.coerce.number().nonnegative().optional().nullable(),
});

const itemPatch = itemInput.partial().extend({
  name: z.string().trim().min(1).optional(),
});

const reserveInput = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
});

const linkInput = z.object({
  url: z.string().url(),
  title: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  shop_name: z.string().trim().optional().nullable(),
  price: z.string().trim().optional().nullable(),
});

function normalizeItem(row: Record<string, unknown>, includeReservationNames: boolean) {
  const isReserved = typeof row.reserved_at === "string" && row.reserved_at.length > 0;

  return {
    ...row,
    is_checked: toBoolean(row.is_checked),
    is_reserved: isReserved,
    reserved_first_name: includeReservationNames ? row.reserved_first_name : null,
    reserved_last_name: includeReservationNames ? row.reserved_last_name : null,
  };
}

export async function itemRoutes(app: FastifyInstance) {
  app.get("/items", async () => {
    return getItems(false);
  });

  app.get("/admin/items", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    return getItems(true);
  });

  function getItems(includeReservationNames: boolean) {
    const categories = db.query(`
      SELECT
        c.id,
        c.name,
        c.sort_order,
        COALESCE(SUM(CASE WHEN i.reserved_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS reserved_count,
        COUNT(i.id) AS total_count
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `).all() as Array<Record<string, unknown>>;

    const items = db.query("SELECT * FROM items ORDER BY id ASC").all() as Array<Record<string, unknown>>;
    const links = db.query("SELECT * FROM item_links ORDER BY id ASC").all() as Array<Record<string, unknown>>;

    const linksByItem = new Map<number, Array<Record<string, unknown>>>();
    for (const link of links) {
      const itemId = Number(link.item_id);
      linksByItem.set(itemId, [...(linksByItem.get(itemId) ?? []), link]);
    }

    const itemsByCategory = new Map<number, Array<Record<string, unknown>>>();
    for (const item of items) {
      const categoryId = Number(item.category_id);
      itemsByCategory.set(categoryId, [
        ...(itemsByCategory.get(categoryId) ?? []),
        { ...normalizeItem(item, includeReservationNames), links: linksByItem.get(Number(item.id)) ?? [] },
      ]);
    }

    return categories.map(category => ({
      ...category,
      checked_count: Number(category.reserved_count),
      reserved_count: Number(category.reserved_count),
      total_count: Number(category.total_count),
      items: itemsByCategory.get(Number(category.id)) ?? [],
    }));
  }

  app.post("/items", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const body = itemInput.parse(request.body);
    const result = db.query(`
      INSERT INTO items (category_id, name, note, assigned_to, price_estimate)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).get(
      body.category_id,
      body.name,
      body.note ?? null,
      body.assigned_to ?? null,
      body.price_estimate ?? null,
    ) as Record<string, unknown>;

    return reply.code(201).send(normalizeItem(result, true));
  });

  app.patch("/items/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = itemPatch.parse(request.body);
    const existing = db.query("SELECT * FROM items WHERE id = ?").get(params.id) as Record<string, unknown> | null;

    if (!existing) {
      return reply.code(404).send({ message: "Item not found" });
    }

    const next = {
      category_id: body.category_id ?? Number(existing.category_id),
      name: body.name ?? String(existing.name),
      note: body.note === undefined ? (existing.note as string | null) : body.note,
      assigned_to: body.assigned_to === undefined ? (existing.assigned_to as string | null) : body.assigned_to,
      price_estimate: body.price_estimate === undefined ? (existing.price_estimate as number | null) : body.price_estimate,
    };

    const updated = db.query(`
      UPDATE items
      SET category_id = ?, name = ?, note = ?, assigned_to = ?, price_estimate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).get(
      next.category_id,
      next.name,
      next.note,
      next.assigned_to,
      next.price_estimate,
      params.id,
    ) as Record<string, unknown>;

    return normalizeItem(updated, true);
  });

  app.patch("/items/:id/fallback-image", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = z.object({ fallback_image: z.string().url().or(z.null()) }).parse(request.body);

    const updated = db.query(`
      UPDATE items
      SET fallback_image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).get(body.fallback_image, params.id) as Record<string, unknown> | null;

    if (!updated) {
      return reply.code(404).send({ message: "Item not found" });
    }

    return normalizeItem(updated, true);
  });

  app.post("/items/:id/reserve", async (request, reply) => {
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = reserveInput.parse(request.body);
    const updated = db.query(`
      UPDATE items
      SET reserved_first_name = ?, reserved_last_name = ?, reserved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND reserved_at IS NULL
      RETURNING *
    `).get(body.first_name, body.last_name, params.id) as Record<string, unknown> | null;

    if (!updated) {
      const existing = db.query("SELECT id, reserved_at FROM items WHERE id = ?").get(params.id) as
        | { id: number; reserved_at: string | null }
        | null;

      if (!existing) {
        return reply.code(404).send({ message: "Item not found" });
      }

      return reply.code(409).send({ message: "Cet article est déjà réservé" });
    }

    return normalizeItem(updated, false);
  });

  app.patch("/items/:id/reservation", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = z.object({ clear: z.literal(true) }).parse(request.body);
    const updated = db.query(`
      UPDATE items
      SET reserved_first_name = NULL, reserved_last_name = NULL, reserved_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).get(params.id) as Record<string, unknown> | null;

    if (!updated) {
      return reply.code(404).send({ message: "Item not found" });
    }

    return normalizeItem(updated, true);
  });

  app.delete("/items/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const result = db.query("DELETE FROM items WHERE id = ? RETURNING id").get(params.id);

    if (!result) {
      return reply.code(404).send({ message: "Item not found" });
    }

    return { ok: true };
  });

  app.post("/items/:id/links", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const body = linkInput.parse(request.body);
    const item = db.query("SELECT id FROM items WHERE id = ?").get(params.id);

    if (!item) {
      return reply.code(404).send({ message: "Item not found" });
    }

    const link = db.query(`
      INSERT INTO item_links (item_id, url, title, image, shop_name, price)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).get(
      params.id,
      body.url,
      body.title ?? null,
      body.image ?? null,
      body.shop_name ?? null,
      body.price ?? null,
    );

    return reply.code(201).send(link);
  });

  app.delete("/item-links/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const params = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const result = db.query("DELETE FROM item_links WHERE id = ? RETURNING id").get(params.id);

    if (!result) {
      return reply.code(404).send({ message: "Link not found" });
    }

    return { ok: true };
  });
}
