import { serve } from "bun";
import fastify from "fastify";
import dotenv from "dotenv";
dotenv.config();
import index from "../src/index.html";
import { migrate } from "./db";
import { categoryRoutes } from "./routes/categories";
import { itemRoutes } from "./routes/items";
import { previewRoutes } from "./routes/preview";

migrate();

const api = fastify({ logger: process.env.NODE_ENV === "production" });
const port = Number(process.env.PORT ?? 3001);

await api.register(
    async (app) => {
        await app.register(categoryRoutes);
        await app.register(itemRoutes);
        await app.register(previewRoutes);
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

const server = serve({
    hostname: "0.0.0.0",
    port,
    routes: {
        "/api/*": handleApiRequest,
        "/*": index,
    },
    development: process.env.NODE_ENV !== "production" && {
        hmr: true,
        console: true,
    },
});

console.log(`Server running at ${server.url}`);
