import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { handleError } from "./http/errors.js";
import { products } from "./modules/products/routes.js";
import { categories } from "./modules/categories/routes.js";
import { sales } from "./modules/sales/routes.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/healthz", (c) => c.json({ status: "ok", service: "pos-server" }));

const api = new Hono();
api.route("/products", products);
api.route("/categories", categories);
api.route("/sales", sales);
app.route("/api", api);

app.onError(handleError);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
