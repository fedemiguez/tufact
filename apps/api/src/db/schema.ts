import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userFiscalProfile = pgTable("user_fiscal_profile", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  cuit: text("cuit").notNull(),
  puntoVenta: integer("punto_venta").notNull(),
  /** false = homologación AFIP */
  production: boolean("production").notNull().default(false),
  certificatePemEncrypted: text("certificate_pem_encrypted").notNull(),
  privateKeyPemEncrypted: text("private_key_pem_encrypted").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userBranding = pgTable("user_branding", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  tradeName: text("trade_name"),
  address: text("address"),
  logoRelativePath: text("logo_relative_path"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cbteTipo: integer("cbte_tipo").notNull().default(11),
  puntoVenta: integer("punto_venta").notNull(),
  cbteNro: integer("cbte_nro").notNull(),
  cae: text("cae").notNull(),
  caeFchVto: text("cae_fch_vto").notNull(),
  impTotal: numeric("imp_total", { precision: 14, scale: 2 }).notNull(),
  clienteTipo: text("cliente_tipo").notNull(),
  docTipo: integer("doc_tipo").notNull(),
  docNro: text("doc_nro").notNull(),
  afipRaw: jsonb("afip_raw"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 14, scale: 4 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  position: integer("position").notNull().default(0),
});

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  items: many(invoiceItems),
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));
