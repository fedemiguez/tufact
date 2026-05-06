# Skill: visión general TUFACT

- **Repo:** `D:\proyectos\tufact` (monorepo pnpm).
- **Paquetes:** `@tufact/api`, `@tufact/mobile`.
- **Dev:** API `pnpm dev:api`, app `pnpm dev:mobile`, DB `docker compose up -d` + `pnpm db:push`.
- **Verdad normativa AFIP:** código + manuales ARCA; no inventar códigos de comprobante en docs sin verificar.

**Anti-patrones:** credenciales AFIP en el cliente; JWT en logs; `ENCRYPTION_KEY` corta en producción.

**Docs:** [docs/architecture.md](../../docs/architecture.md), [AGENTS.md](../../AGENTS.md).
