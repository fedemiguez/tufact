# Skill: Postgres y Drizzle

- **Esquema:** `apps/api/src/db/schema.ts` (tablas + relaciones).
- **Cliente:** `postgres` + `drizzle-orm`.
- **Push dev:** `pnpm --filter @tufact/api db:push` con `DATABASE_URL`.

**Índices:** filtrar siempre por `user_id` en facturas y branding.

**Archivos:** `apps/api/drizzle.config.ts`, [docs/domain-model.md](../../docs/domain-model.md).
