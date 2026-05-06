# Skill: dominio fiscal AFIP / ARCA

- **Modelo:** 1 usuario ↔ 1 `user_fiscal_profile` (CUIT, PV, homo/prod).
- **Comprobante MVP:** Factura **C** (`CbteTipo` 11) vía `@afipsdk/afip.js` → `createNextVoucher` con cuerpo construido en `apps/api/src/lib/afip.ts`.
- **Cliente:** consumidor final (`DocTipo` 99 / `DocNro` 0) o CUIT (`DocTipo` 80).
- **Homologación:** `production: false` en perfil fiscal.

**No asumir** topes de montos ni RG nuevas: revisar manual vigente.

**Archivos:** `apps/api/src/lib/afip.ts`, `apps/api/src/routes/me.ts`, [docs/afip-onboarding.md](../../docs/afip-onboarding.md).
