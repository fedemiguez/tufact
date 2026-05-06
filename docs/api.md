# API HTTP

Base: `http://HOST:PORT` (default `3001`).

## Auth

- `POST /auth/register` — JSON `{ "email", "password" }` → `{ token, user }`
- `POST /auth/login` — mismo cuerpo

Header autenticado: `Authorization: Bearer <jwt>`

## Perfil fiscal y marca (`/me`)

- `GET /me/fiscal-status` — `{ configured, cuit?, puntoVenta?, production? }`
- `POST /me/fiscal-credentials` — `multipart/form-data`: campos `cuit`, `puntoVenta`, `production` (`true`/`false`); archivos `certificate` y `privateKey` (PEM)
- `GET /me/branding` — objeto branding o valores nulos
- `PATCH /me/branding` — JSON `{ tradeName?, address? }`
- `POST /me/logo` — `multipart` campo `file` (imagen)
- `POST /me/invoices` — JSON:

```json
{
  "clienteTipo": "consumidor_final" | "cuit",
  "cuitCliente": "solo si cuit",
  "items": [{ "description": "", "quantity": 1, "unitPrice": 100 }]
}
```

- `GET /me/invoices` — lista con ítems
- `GET /me/invoices/:id` — detalle
- `GET /me/invoices/:id/pdf` — binario PDF

## Público

- `GET /health`

Archivos logo servidos bajo `/uploads/...` (misma instancia API).
