# Skill: seguridad API y secretos

- **JWT:** `JWT_SECRET` robusto; payload mínimo `sub`, `email`.
- **PEM:** guardados cifrados (`apps/api/src/lib/crypto.ts`); nunca en respuestas JSON ni logs.
- **Multipart:** límites de tamaño en Fastify; validar MIME en logos cuando endurezcas.

**Anti-patrones:** almacenar clave privada en AsyncStorage; imprimir XML/respuestas AFIP completas en cliente.

**Archivos:** `apps/api/src/lib/crypto.ts`, `apps/api/src/routes/auth.ts`, `apps/api/src/routes/me.ts`.
