# Baby Wishlist

Full-stack baby wishlist app built with Bun, Fastify, React, Tailwind, React Query, and SQLite.

## Setup

```bash
bun install
bun run seed
```

## Development

Run the app and API together:

```bash
bun run dev
```

The Bun server listens on `http://localhost:3001` and serves both the React app and `/api` routes.

Public visitors use `/` to reserve gifts. The admin page is `/admin`.

In development, the admin token defaults to `admin`. In production, set `ADMIN_TOKEN` before running `bun start`.

## Production

```bash
bun run build
bun start
```
