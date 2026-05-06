# TUFACT

Facturación electrónica (Factura C / monotributo) con ARCA/AFIP, PDF y ticket térmico Bluetooth.

## Requisitos

- Node 20+
- pnpm 10+
- Docker (opcional) para Postgres local

## Inicio rápido

```bash
cd D:\proyectos\tufact
docker compose up -d
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm --filter @tufact/api db:push
pnpm dev:api
```

En otra terminal:

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Ajustá EXPO_PUBLIC_API_URL para tu red / emulador
pnpm dev:mobile
```

**Android emulador:** `EXPO_PUBLIC_API_URL=http://10.0.2.2:3001`

**Dispositivo físico:** IP LAN de tu PC, p. ej. `http://192.168.1.x:3001`

## Scripts

| Script | Descripción |
| ------ | ----------- |
| `pnpm dev:api` | API Fastify en caliente |
| `pnpm dev:mobile` | Expo |
| `pnpm --filter @tufact/api db:push` | Aplicar esquema Drizzle a Postgres |
| `pnpm --filter @tufact/api db:studio` | Drizzle Studio |

## Estructura

- `apps/api` — REST `/auth/*`, `/me/*`, PDF, cifrado de credenciales AFIP
- `apps/mobile` — Expo (iOS/Android/Web), BLE térmica con `react-native-thermal-receipt-printer`

## Documentación

Ver carpeta [docs/](docs/) y [AGENTS.md](AGENTS.md).
