import { Platform } from "react-native";
import type { InvoiceRow } from "./receipt";
import { buildThermalReceipt } from "./receipt";

type Branding = { tradeName?: string | null; address?: string | null };

export async function printThermalInvoice(inv: InvoiceRow, branding?: Branding): Promise<string> {
  if (Platform.OS === "web") {
    return "La impresión térmica Bluetooth no está disponible en web. Usá PDF desde el detalle.";
  }
  const { BLEPrinter } = await import("react-native-thermal-receipt-printer");
  const text = buildThermalReceipt(inv, branding);
  await BLEPrinter.init();
  const list = await BLEPrinter.getDeviceList();
  if (!list.length) {
    return "No se encontraron impresoras BLE. Emparejá la impresora en Ajustes.";
  }
  const mac = list[0].inner_mac_address;
  await BLEPrinter.connectPrinter(mac);
  BLEPrinter.printBill(text, { encoding: "ISO-8859-1", beep: false, cut: true, tailingLine: true });
  await BLEPrinter.closeConn();
  return "Enviado a impresora.";
}
