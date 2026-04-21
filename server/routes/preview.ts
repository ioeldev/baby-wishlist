import type { FastifyInstance } from "fastify";
import ogs from "open-graph-scraper";
import { z } from "zod";

type Preview = {
  url: string;
  title: string | null;
  image: string | null;
  price: string | null;
  shop_name: string | null;
};

const cache = new Map<string, { expiresAt: number; value: Preview }>();
const ttl = 60 * 60 * 1000;

function shopNameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function firstImage(result: unknown): string | null {
  if (!Array.isArray(result) || result.length === 0) return null;
  const first = result[0] as { url?: string };
  return first.url ?? null;
}

export async function previewRoutes(app: FastifyInstance) {
  app.get("/preview", async (request) => {
    const query = z.object({ url: z.string().url() }).parse(request.query);
    const normalizedUrl = new URL(query.url).toString();
    const cached = cache.get(normalizedUrl);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    let value: Preview;

    try {
      const { result } = await ogs({ url: normalizedUrl, timeout: 8000 });
      const raw = result as Record<string, unknown>;
      value = {
        url: normalizedUrl,
        title: typeof raw.ogTitle === "string" ? raw.ogTitle : typeof raw.twitterTitle === "string" ? raw.twitterTitle : null,
        image: firstImage(raw.ogImage) ?? firstImage(raw.twitterImage),
        price: typeof raw.productPriceAmount === "string" ? raw.productPriceAmount : null,
        shop_name: typeof raw.ogSiteName === "string" ? raw.ogSiteName : shopNameFromUrl(normalizedUrl),
      };
    } catch {
      value = {
        url: normalizedUrl,
        title: null,
        image: null,
        price: null,
        shop_name: shopNameFromUrl(normalizedUrl),
      };
    }

    cache.set(normalizedUrl, { expiresAt: Date.now() + ttl, value });
    return value;
  });
}
