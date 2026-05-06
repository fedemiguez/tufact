# Skill: Expo y React Native

- **Nombre app:** TUFACT (`app.json`).
- **Env:** `EXPO_PUBLIC_API_URL` → API alcanzable desde dispositivo/emulador.
- **Prebuild:** necesario para módulos nativos (impresora térmica); Expo Go no alcanza para BLE.
- **Web:** `expo start --web`; limitaciones en FileSystem legacy y Bluetooth.

**Archivos:** `apps/mobile/App.tsx`, `apps/mobile/app.json`, [docs/thermal-printing.md](../../docs/thermal-printing.md).
