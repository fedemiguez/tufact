# Modelo de dominio

| Tabla | Descripción |
| ----- | ----------- |
| `users` | Email + hash bcrypt; auth JWT (`sub` = id). |
| `user_fiscal_profile` | PK = `user_id`. CUIT, punto de venta, `production`, cert/key PEM cifrados. |
| `user_branding` | PK = `user_id`. Nombre comercial, dirección, ruta relativa de logo en disco (`uploads/...`). |
| `invoices` | Comprobante emitido: tipo 11 (Factura C), nro, CAE, importe, doc receptor, JSON crudo AFIP. |
| `invoice_items` | Líneas por factura (cantidad, precio, importe). |

Estados: MVP sin máquina de estados; factura creada = autorizada por AFIP (si falla, no se persiste).
