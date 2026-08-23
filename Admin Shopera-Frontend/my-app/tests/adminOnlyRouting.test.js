import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Admin app exposes only Admin runtime routes", async () => {
  const routes = await source("../src/routes/AppRoutes.jsx");
  assert.match(routes, /path="\/admin"/);
  assert.match(routes, /path="\/login"/);
  assert.doesNotMatch(routes, /pages\/buyer|pages\/seller/);
  assert.doesNotMatch(routes, /path="\/cart"|path="\/checkout"|path="\/account|path="\/seller|path="\/products|path="\/collections/);
});

test("Admin runtime does not mount Buyer Cart context or drawer", async () => {
  const main = await source("../src/main.jsx");
  const app = await source("../src/App.jsx");
  assert.doesNotMatch(main, /CartContextProvider/);
  assert.doesNotMatch(app, /CartDrawer/);
});

test("Admin local development does not bypass Vite proxy", async () => {
  const env = await source("../.env.development");
  const vite = await source("../vite.config.js");
  assert.doesNotMatch(env, /^VITE_API_BASE_URL=/m);
  assert.match(vite, /port:\s*5174/);
  assert.match(vite, /"\/api"/);
  assert.match(vite, /"\/hubs"/);
});
