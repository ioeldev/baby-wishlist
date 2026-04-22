#!/usr/bin/env bun
import tailwind from "bun-plugin-tailwind";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  await rm(outdir, { recursive: true, force: true });
}

const result = await Bun.build({
  entrypoints: [path.join(process.cwd(), "src/index.html")],
  outdir,
  plugins: [tailwind],
  publicPath: "/",
  minify: true,
  target: "browser",
  sourcemap: "linked",
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}

console.log(`Built ${result.outputs.length} files to dist`);
