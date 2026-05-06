import fs from "node:fs/promises";
import path from "node:path";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import "dotenv/config";
import { authRoutes } from "./routes/auth.js";
import { meRoutes } from "./routes/me.js";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 16) {
  console.warn("JWT_SECRET débil o ausente — usá uno largo en producción");
}

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(fastifyJwt, {
  secret: jwtSecret ?? "dev-only-change-me-in-production-min-16-chars",
});
app.decorate(
  "authenticate",
  async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "No autorizado" });
    }
  },
);

await app.register(multipart, {
  limits: { fileSize: 6 * 1024 * 1024 },
});

const uploadsRoot = path.join(process.cwd(), "uploads");
await fs.mkdir(uploadsRoot, { recursive: true });
await app.register(fastifyStatic, {
  root: uploadsRoot,
  prefix: "/uploads/",
});

await app.register(authRoutes);
await app.register(meRoutes);

app.get("/health", async () => ({ ok: true, service: "tufact-api" }));

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
app.log.info(`TUFACT API en http://${host}:${port}`);
