# Impresión térmica (58 mm)

- **Librería:** `react-native-thermal-receipt-printer` (BLE / USB / Net según modelo).
- **Prebuild:** requiere **development build** de Expo; no Expo Go.
- **Android:** permisos Bluetooth en `app.json`.
- **Contenido:** texto plano ~40 columnas; comando `printBill` con encoding `ISO-8859-1` para acentos.
- **Flujo actual:** primera impresora BLE de la lista (MVP). Mejorar UX: selector de dispositivo.
- **Web/desktop:** no soportado; usar PDF.
