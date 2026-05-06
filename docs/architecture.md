# Arquitectura TUFACT

```mermaid
flowchart LR
  subgraph client [Expo]
    Mobile[iOS Android]
    Web[Expo Web]
  end
  subgraph api [apps_api]
    Fastify[Fastify JWT]
    Drizzle[Drizzle Postgres]
    AfipSDK[AfipSDK cloud auth]
  end
  subgraph ext [Externo]
    Postgres[(Postgres)]
    Afip[ARCA AFIP WSFE]
  end
  Mobile --> Fastify
  Web --> Fastify
  Fastify --> Drizzle
  Drizzle --> Postgres
  Fastify --> AfipSDK
  AfipSDK --> Afip
```

- **1 usuario = 1 CUIT**: tabla `user_fiscal_profile` 1:1 con `users`.
- **Secretos**: certificado y clave PEM solo en servidor, cifrados con `ENCRYPTION_KEY`.
- **SDK**: `@afipsdk/afip.js` obtiene TA vía API AfipSDK y llama WSFE (FECAESolicitar) según configuración del SDK.
