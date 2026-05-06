# Skill: deploy Vercel y alternativas

- **Web estática** (Expo export) encaja bien en Vercel.
- **API Node:** valorar **Railway/Render/Fly** si Functions limitan SOAP o archivos temporales; ver [docs/deployment.md](../../docs/deployment.md).
- **DB:** Postgres gestionado (Neon, etc.); no SQLite en serverless.
- **Archivos:** uploads a Blob/S3 en prod; desarrollo usa `uploads/` local.

**Checklist:** HTTPS, secrets, CORS, backups.
