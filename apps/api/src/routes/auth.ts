import type { FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = registerSchema;

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const existing = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (existing) {
      return reply.status(409).send({ error: "Email ya registrado" });
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const [row] = await db
      .insert(users)
      .values({ email: body.email, passwordHash })
      .returning({ id: users.id, email: users.email });
    const token = app.jwt.sign({ sub: row.id, email: row.email });
    return { token, user: { id: row.id, email: row.email } };
  });

  app.post("/auth/login", async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.status(401).send({ error: "Credenciales inválidas" });
    }
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  });
};
