# Skill: PDF y branding

- **Generación:** `pdfkit` en servidor (`apps/api/src/lib/pdf.ts`).
- **Datos:** branding desde `user_branding` + datos fiscales de `invoices`.
- **Ruta:** `GET /me/invoices/:id/pdf`.
- **Logo en PDF (futuro):** embeb `logoRelativePath` desde uploads si existe.

**Archivos:** `apps/api/src/lib/pdf.ts`, `apps/api/src/routes/me.ts`.
