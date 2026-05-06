import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import {
  invoiceItems,
  invoices,
  userBranding,
  userFiscalProfile,
} from "../db/schema.js";
import { encryptString } from "../lib/crypto.js";
import { buildFacturaCBody, withAfipForUser } from "../lib/afip.js";
import { buildInvoicePdf } from "../lib/pdf.js";

const brandingPatch = z.object({
  tradeName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const fiscalFields = z.object({
  cuit: z.string().min(10),
  puntoVenta: z.coerce.number().int().positive(),
});

const invoiceItemIn = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

const createInvoiceBody = z.object({
  clienteTipo: z.enum(["consumidor_final", "cuit"]),
  cuitCliente: z.string().optional(),
  items: z.array(invoiceItemIn).min(1),
});

function getUserId(req: { user: { sub: string } }): string {
  return req.user.sub;
}

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/me/fiscal-status", async (req) => {
    const userId = getUserId(req);
    const profile = await db.query.userFiscalProfile.findFirst({
      where: eq(userFiscalProfile.userId, userId),
    });
    if (!profile) {
      return {
        configured: false,
      };
    }
    return {
      configured: true,
      cuit: profile.cuit,
      puntoVenta: profile.puntoVenta,
      production: profile.production,
    };
  });

  app.post("/me/fiscal-credentials", async (req, reply) => {
    const userId = getUserId(req);
    const fields: Record<string, string> = {};
    let certBody = "";
    let keyBody = "";


    for await (const part of req.parts()) {
      if (part.type === "field") {
        fields[part.fieldname] = String(part.value);
      } else {
        const buffer = await part.toBuffer();
        const text = buffer.toString("utf8");
        if (part.fieldname === "certificate" || part.fieldname === "cert") {
          certBody = text;
        } else if (part.fieldname === "privateKey" || part.fieldname === "key") {
          keyBody = text;
        }
      }
    }

    const meta = fiscalFields.safeParse({
      cuit: fields.cuit,
      puntoVenta: fields.puntoVenta,
    });
    if (!meta.success) {
      return reply.status(400).send({ error: "cuit, puntoVenta requeridos", details: meta.error.flatten() });
    }
    const production = fields.production === "true" || fields.production === "1";
    if (!certBody.trim() || !keyBody.trim()) {
      return reply.status(400).send({ error: "Archivos certificate y privateKey PEM requeridos" });
    }

    const certEnc = encryptString(certBody);
    const keyEnc = encryptString(keyBody);

    await db
      .insert(userFiscalProfile)
      .values({
        userId,
        cuit: meta.data.cuit.replace(/\D/g, ""),
        puntoVenta: meta.data.puntoVenta,
        production,
        certificatePemEncrypted: certEnc,
        privateKeyPemEncrypted: keyEnc,
      })
      .onConflictDoUpdate({
        target: userFiscalProfile.userId,
        set: {
          cuit: meta.data.cuit.replace(/\D/g, ""),
          puntoVenta: meta.data.puntoVenta,
          production,
          certificatePemEncrypted: certEnc,
          privateKeyPemEncrypted: keyEnc,
          updatedAt: new Date(),
        },
      });

    return { ok: true };
  });

  app.get("/me/branding", async (req) => {
    const userId = getUserId(req);
    const row = await db.query.userBranding.findFirst({
      where: eq(userBranding.userId, userId),
    });
    return row ?? { userId, tradeName: null, address: null, logoRelativePath: null };
  });

  app.patch("/me/branding", async (req) => {
    const userId = getUserId(req);
    const body = brandingPatch.parse(req.body);
    await db
      .insert(userBranding)
      .values({
        userId,
        tradeName: body.tradeName ?? null,
        address: body.address ?? null,
      })
      .onConflictDoUpdate({
        target: userBranding.userId,
        set: {
          tradeName: body.tradeName ?? null,
          address: body.address ?? null,
          updatedAt: new Date(),
        },
      });
    const row = await db.query.userBranding.findFirst({
      where: eq(userBranding.userId, userId),
    });
    return row;
  });

  app.post("/me/logo", async (req, reply) => {
    const userId = getUserId(req);
    const file = await req.file();
    if (!file) {
      return reply.status(400).send({ error: "file requerido" });
    }
    const ext = path.extname(file.filename || "") || ".png";
    const dir = path.join("uploads", userId);
    await fs.mkdir(dir, { recursive: true });
    const rel = path.join("uploads", userId, `logo${ext}`).replace(/\\/g, "/");
    const buf = await file.toBuffer();
    await fs.writeFile(rel, buf);
    await db
      .insert(userBranding)
      .values({ userId, logoRelativePath: rel })
      .onConflictDoUpdate({
        target: userBranding.userId,
        set: { logoRelativePath: rel, updatedAt: new Date() },
      });
    return { logoUrl: `/${rel}` };
  });

  app.post("/me/invoices", async (req, reply) => {
    const userId = getUserId(req);
    const body = createInvoiceBody.parse(req.body);
    const profile = await db.query.userFiscalProfile.findFirst({
      where: eq(userFiscalProfile.userId, userId),
    });
    if (!profile) {
      return reply.status(400).send({ error: "Configurá credenciales AFIP primero" });
    }

    let docTipo = 99;
    let docNro = 0;
    let clienteLabel = "A CONSUMIDOR FINAL";
    if (body.clienteTipo === "cuit") {
      const raw = body.cuitCliente?.replace(/\D/g, "") ?? "";
      if (raw.length !== 11) {
        return reply.status(400).send({ error: "CUIT cliente inválido" });
      }
      docTipo = 80;
      docNro = parseInt(raw, 10);
      clienteLabel = `CUIT ${raw}`;
    }

    const items = body.items.map((it, i) => {
      const qty = Math.round(it.quantity * 10000) / 10000;
      const unit = Math.round(it.unitPrice * 10000) / 10000;
      const amount = Math.round(qty * unit * 100) / 100;
      return {
        position: i,
        description: it.description,
        quantity: qty.toString(),
        unitPrice: unit.toString(),
        amount: amount.toString(),
      };
    });
    const impTotal = items.reduce((s, it) => s + parseFloat(it.amount), 0);

    try {
      const afipResult = await withAfipForUser(
        profile.certificatePemEncrypted,
        profile.privateKeyPemEncrypted,
        profile.cuit,
        profile.production,
        async (afip) => {
          const voucherData = buildFacturaCBody({
            puntoVenta: profile.puntoVenta,
            docTipo,
            docNro,
            impTotal,
          });
          return afip.ElectronicBilling.createNextVoucher(voucherData);
        },
      );

      const cae = String(afipResult.CAE ?? afipResult.cae ?? "");
      const caeFchVto = String(afipResult.CAEFchVto ?? afipResult.vto ?? "");
      const cbteNro = Number(afipResult.voucherNumber ?? afipResult.CbteDesde ?? 0);

      const [inv] = await db
        .insert(invoices)
        .values({
          userId,
          cbteTipo: 11,
          puntoVenta: profile.puntoVenta,
          cbteNro: cbteNro,
          cae,
          caeFchVto,
          impTotal: impTotal.toFixed(2),
          clienteTipo: body.clienteTipo,
          docTipo,
          docNro: String(docNro),
          afipRaw: afipResult as object,
        })
        .returning();

      await db.insert(invoiceItems).values(
        items.map((it) => ({
          invoiceId: inv.id,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          amount: it.amount,
          position: it.position,
        })),
      );

      return {
        id: inv.id,
        cbteNro,
        cae,
        caeFchVto,
        impTotal: impTotal.toFixed(2),
        clienteLabel,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error AFIP";
      req.log.error(e);
      return reply.status(502).send({ error: "AFIP rechazó la operación", detail: msg });
    }
  });

  app.get("/me/invoices", async (req) => {
    const userId = getUserId(req);
    const list = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      with: { items: true },
    });
    return list;
  });

  app.get("/me/invoices/:id", async (req, reply) => {
    const userId = getUserId(req);
    const { id } = req.params as { id: string };
    const inv = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: { items: true },
    });
    if (!inv || inv.userId !== userId) {
      return reply.status(404).send({ error: "No encontrado" });
    }
    return inv;
  });

  app.get("/me/invoices/:id/pdf", async (req, reply) => {
    const userId = getUserId(req);
    const { id } = req.params as { id: string };
    const inv = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: { items: true },
    });
    if (!inv || inv.userId !== userId) {
      return reply.status(404).send({ error: "No encontrado" });
    }
    const branding = await db.query.userBranding.findFirst({
      where: eq(userBranding.userId, userId),
    });
    const profile = await db.query.userFiscalProfile.findFirst({
      where: eq(userFiscalProfile.userId, userId),
    });
    const clienteLabel =
      inv.clienteTipo === "consumidor_final" ? "A CONSUMIDOR FINAL" : `CUIT ${inv.docNro}`;
    const fecha = inv.createdAt.toISOString().split("T")[0];
    const pdfBuf = await buildInvoicePdf({
      tradeName: branding?.tradeName,
      address: branding?.address,
      cuitEmisor: profile?.cuit ?? "",
      puntoVenta: inv.puntoVenta,
      cbteTipo: inv.cbteTipo,
      cbteNro: inv.cbteNro,
      cae: inv.cae,
      caeFchVto: inv.caeFchVto,
      fecha,
      clienteLabel,
      docTipo: inv.docTipo,
      docNro: inv.docNro,
      impTotal: String(inv.impTotal),
      items: inv.items.map((r) => ({
        description: r.description,
        quantity: String(r.quantity),
        unitPrice: String(r.unitPrice),
        amount: String(r.amount),
      })),
    });
    reply.header("Content-Type", "application/pdf");
    reply.header(
      "Content-Disposition",
      `attachment; filename="TUFACT-${inv.cbteNro}.pdf"`,
    );
    return reply.send(pdfBuf);
  });
};
