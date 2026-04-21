import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "wishlist.db"));
db.exec("PRAGMA foreign_keys = ON");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      note TEXT,
      is_checked INTEGER NOT NULL DEFAULT 0,
      reserved_first_name TEXT,
      reserved_last_name TEXT,
      reserved_at TEXT,
      assigned_to TEXT,
      price_estimate REAL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS item_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      image TEXT,
      shop_name TEXT,
      price TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
    CREATE INDEX IF NOT EXISTS idx_item_links_item_id ON item_links(item_id);
  `);

  const columns = db.query("PRAGMA table_info(items)").all() as Array<{ name: string }>;
  const existing = new Set(columns.map(column => column.name));

  if (!existing.has("reserved_first_name")) {
    db.exec("ALTER TABLE items ADD COLUMN reserved_first_name TEXT");
  }

  if (!existing.has("reserved_last_name")) {
    db.exec("ALTER TABLE items ADD COLUMN reserved_last_name TEXT");
  }

  if (!existing.has("reserved_at")) {
    db.exec("ALTER TABLE items ADD COLUMN reserved_at TEXT");
  }
}

export function toBoolean(value: unknown) {
  return value === 1 || value === true;
}

migrate();
