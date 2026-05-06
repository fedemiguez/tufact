# Skill: impresión térmica ESC/POS

- **Librería:** `react-native-thermal-receipt-printer` → `BLEPrinter`.
- **Ticket:** texto generado en `apps/mobile/src/lib/receipt.ts` (~40 cols).
- **Encoding:** `ISO-8859-1` en `printBill`.
- **MVP:** conecta al **primer** dispositivo BLE encontrado.

**Mejoras:** picker de dispositivo; raster de logo (SDK/comandos nativos).

**Docs:** [docs/thermal-printing.md](../../docs/thermal-printing.md).
