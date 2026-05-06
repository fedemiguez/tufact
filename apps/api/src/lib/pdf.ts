import PDFDocument from "pdfkit";
import type { InvoiceItem } from "../types.js";

export type PdfInvoiceInput = {
  tradeName?: string | null;
  address?: string | null;
  cuitEmisor: string;
  puntoVenta: number;
  cbteTipo: number;
  cbteNro: number;
  cae: string;
  caeFchVto: string;
  fecha: string;
  clienteLabel: string;
  docTipo: number;
  docNro: string;
  impTotal: string;
  items: InvoiceItem[];
};

export function buildInvoicePdf(input: PdfInvoiceInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text("TUFACT — Comprobante electrónico", { align: "center" });
    doc.moveDown();

    if (input.tradeName) doc.fontSize(12).text(input.tradeName, { align: "center" });
    if (input.address) doc.fontSize(10).text(input.address, { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`CUIT emisor: ${input.cuitEmisor}`);
    doc.text(`Punto de venta: ${input.puntoVenta.toString().padStart(4, "0")} — Comprobante tipo ${input.cbteTipo}`);
    doc.text(`Número: ${input.cbteNro}`);
    doc.text(`Fecha: ${input.fecha}`);
    doc.moveDown();
    doc.text(`Cliente: ${input.clienteLabel}`);
    doc.text(`Doc. receptor: tipo ${input.docTipo} — ${input.docNro}`);
    doc.moveDown();

    doc.fontSize(11).text("Ítems", { underline: true });
    doc.moveDown(0.5);
    for (const it of input.items) {
      doc.fontSize(10).text(
        `${it.description} — ${it.quantity} x $${it.unitPrice} = $${it.amount}`,
      );
    }
    doc.moveDown();
    doc.fontSize(12).text(`Total: $${input.impTotal}`, { align: "right" });
    doc.moveDown();
    doc.fontSize(10).text(`CAE: ${input.cae}`);
    doc.text(`Vto. CAE: ${input.caeFchVto}`);

    doc.end();
  });
}
