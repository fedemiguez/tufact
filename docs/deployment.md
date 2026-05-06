# Despliegue

## Variables de entorno (API)

| Variable | Uso |
| -------- | --- |
| `DATABASE_URL` | Postgres (Neon, RDS, etc.) — Necesario en producción. |
| `JWT_SECRET` | Firma JWT, mín. 16 caracteres seguros. |
| `ENCRYPTION_KEY` | Secreto ≥32 caracteres para AES-256-GCM de PEM. |
| `PORT` / `HOST` | Bind del servidor. |

## Opciones

1. **Vercel Functions** + Neon + Blob: validar timeouts SOAP y uso de `/tmp` con `@afipsdk/afip.js`.
2. **Railway / Render / Fly.io**: un contenedor Node ejecutando `pnpm --filter @tufact/api start` tras `db:push` o migraciones.

## Web / Expo

- Build web: `expo export` o flujo EAS; hospedar estáticos en Vercel. `EXPO_PUBLIC_API_URL` debe apuntar al dominio HTTPS del API.

## Checklist pre-prod

- [ ] `JWT_SECRET` y `ENCRYPTION_KEY` rotados, no default
- [ ] HTTPS en API
- [ ] CORS restringido a dominio del front
- [ ] Backups de Postgres
