import { serve } from "bun";
import fastify from "fastify";
import dotenv from "dotenv";
import path from "node:path";
dotenv.config();
import { migrate } from "./db";
import { seedIfEmpty } from "./seed";
import { categoryRoutes } from "./routes/categories";
import { itemRoutes } from "./routes/items";
import { previewRoutes } from "./routes/preview";
import { uploadRoutes } from "./routes/upload";
migrate();
seedIfEmpty();

const api = fastify({ logger: process.env.NODE_ENV === "production" });
const port = Number(process.env.PORT ?? 3001);
const production = process.env.NODE_ENV === "production";
const distDir = path.join(process.cwd(), "dist");
const devIndex = production ? null : (await import("../src/index.html")).default;

await api.register(
    async (app) => {
        await app.register(categoryRoutes);
        await app.register(itemRoutes);
        await app.register(previewRoutes);
        await app.register(uploadRoutes);
    },
    { prefix: "/api" }
);

await api.ready();

async function handleApiRequest(request: Request) {
    const url = new URL(request.url);
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });

    const response = await api.inject({
        method: request.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS",
        url: `${url.pathname}${url.search}`,
        headers,
        payload: body,
    });

    return new Response(response.body, {
        status: response.statusCode,
        headers: response.headers as HeadersInit,
    });
}

async function handleStaticRequest(request: Request) {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    const requestedPath = pathname === "/" ? "/index.html" : pathname;
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(distDir, normalizedPath);

    if (!filePath.startsWith(distDir)) {
        return new Response("Not found", { status: 404 });
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
        return new Response(file);
    }

    if (path.extname(pathname)) {
        return new Response("Not found", { status: 404 });
    }

    const indexFile = Bun.file(path.join(distDir, "index.html"));
    if (await indexFile.exists()) {
        return new Response(indexFile);
    }

    return new Response("Frontend build not found. Run `bun run build` before `bun start`.", { status: 500 });
}

if (!production && !devIndex) {
    throw new Error("Development frontend entry not available");
}

const server = serve({
    hostname: "0.0.0.0",
    port,
    routes: production
        ? {
            "/api/*": handleApiRequest,
            "/*": handleStaticRequest,
        }
        : {
            "/api/*": handleApiRequest,
            "/*": devIndex!,
        },
    development: !production && {
        hmr: true,
        console: true,
    },
});

console.log(`Server running at ${server.url}`);
