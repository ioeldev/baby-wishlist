---
description: Project guidance for the Baby Wishlist app.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# Baby Wishlist Guidance

Use Bun as the runtime and package manager:

- Use `bun install` for dependencies.
- Use `bun run <script>` for package scripts.
- Use `bun server/seed.ts` or `bun run seed` for the SQLite seed.
- Use `bun:sqlite` for database access.

## Architecture

- Runtime server: Bun.serve in `server/index.ts`.
- Backend routing: Fastify route tree injected for `/api/*`.
- Database: SQLite through `server/db.ts`, stored at `data/wishlist.db`.
- API routes: `server/routes/**`, mounted under `/api`.
- Frontend: React through Bun HTML imports, with entrypoint `src/main.tsx`.
- Production build: `bun run build`; `bun start` serves the app through Bun.
- Public page `/`: read-only wishlist with `Offrir` reservation flow.
- Admin page `/admin`: protected by `ADMIN_TOKEN`, can edit items/categories/links and see reserver names.

## Commands

```sh
bun install
bun run seed
bun run dev
bun run typecheck
bun run build
```

The default app/API port is `3001`. In development, the fallback admin token is `admin`; production requires `ADMIN_TOKEN`.
