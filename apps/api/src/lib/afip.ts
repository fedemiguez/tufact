import Afip from "@afipsdk/afip.js";
import { decryptString } from "./crypto.js";

type AfipInstance = InstanceType<typeof Afip>;

export async function withAfipForUser<T>(
  certEncrypted: string,
  keyEncrypted: string,
  cuit: string,
  production: boolean,
  fn: (afip: AfipInstance) => Promise<T>,
): Promise<T> {
  const cert = decryptString(certEncrypted);
  const key = decryptString(keyEncrypted);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afip = new Afip({
    CUIT: parseInt(cuit.replace(/\D/g, ""), 10),
    cert,
    key,
    production,
  } as any);
  return fn(afip);
}

export type FacturaCParams = {
  puntoVenta: number;
  docTipo: number;
  docNro: number;
  impTotal: number;
};

export function buildFacturaCBody(params: FacturaCParams): Record<string, unknown> {
  const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  const { puntoVenta, docTipo, docNro, impTotal } = params;
  const t = Math.round(impTotal * 100) / 100;
  return {
    CantReg: 1,
    PtoVta: puntoVenta,
    CbteTipo: 11,
    Concepto: 1,
    DocTipo: docTipo,
    DocNro: docNro,
    CbteFch: parseInt(date.replace(/-/g, ""), 10),
    ImpTotal: t,
    ImpTotConc: 0,
    ImpNeto: t,
    ImpOpEx: 0,
    ImpTrib: 0,
    ImpIVA: 0,
    MonId: "PES",
    MonCotiz: 1,
  };
}
