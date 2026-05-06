export type InvoiceRow = {
  id: string;
  cbteNro: number;
  cae: string;
  caeFchVto: string;
  impTotal: string;
  clienteTipo: string;
  createdAt: string;
  items?: { description: string; quantity: string; unitPrice: string; amount: string }[];
};

export function buildThermalReceipt(i: InvoiceRow, branding?: { tradeName?: string | null; address?: string | null }): string {
  const w = 40;
  const line = (s: string) => s.padEnd(w).substring(0, w) + "\n";
  const sep = "-".repeat(w) + "\n";
  let out = "";
  out += line("TUFACT");
  if (branding?.tradeName) out += line(branding.tradeName);
  if (branding?.address) {
    for (const chunk of chunkStr(branding.address, w)) out += line(chunk);
  }
  out += sep;
  out += line(`Comp: ${i.cbteNro}`);
  out += line(`Total: $${i.impTotal}`);
  out += line(`CAE: ${i.cae}`);
  out += line(`Vto CAE: ${i.caeFchVto}`);
  out += sep;
  if (i.items?.length) {
    for (const it of i.items) {
      out += line(it.description.substring(0, w));
      out += line(` ${it.quantity} x ${it.unitPrice} = ${it.amount}`);
    }
  }
  out += sep;
  out += "\n\n";
  return out;
}

function chunkStr(s: string, n: number): string[] {
  const r: string[] = [];
  for (let i = 0; i < s.length; i += n) r.push(s.slice(i, i + n));
  return r;
}
