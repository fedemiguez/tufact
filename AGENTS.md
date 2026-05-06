# TUFACT — agente / IA

Monorepo en `D:\proyectos\tufact`: `apps/api` (Fastify + Drizzle + Postgres + AFIP SDK), `apps/mobile` (Expo 54 + navegación + térmica BLE).

## Cómo correr en local

1. Postgres: `docker compose up -d` (o URL en `DATABASE_URL`).
2. API: copiá `apps/api/.env.example` → `apps/api/.env`, luego `pnpm --filter @tufact/api db:push` y `pnpm dev:api`.
3. Mobile: `apps/mobile/.env` con `EXPO_PUBLIC_API_URL` (Android emulador suele ser `http://10.0.2.2:3001`). `pnpm dev:mobile`.

## Skills Cursor

Ver [.cursor/skills/](.cursor/skills/) — un archivo por dominio (AFIP, térmica, deploy, etc.).

## Documentación humana

- [docs/architecture.md](docs/architecture.md)
- [docs/domain-model.md](docs/domain-model.md)
- [docs/api.md](docs/api.md)
- [docs/afip-onboarding.md](docs/afip-onboarding.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/thermal-printing.md](docs/thermal-printing.md)

## Reglas de mantenimiento

Cada cambio de contrato API, tabla o flujo fiscal: actualizar el `docs/` correspondiente y una línea en [CHANGELOG.md](CHANGELOG.md) (sección Unreleased).
