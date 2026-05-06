# Onboarding AFIP / ARCA (desarrollo)

1. Obtener certificado de **homologación** y clave privada para el CUIT emisor (procedimiento en sitio ARCA/AFIP).
2. Autorizar el servicio de facturación electrónica (WSFE) para ese certificado.
3. En la app TUFACT → **AFIP**, cargar CUIT, punto de venta, dejar **producción** apagada para pruebas.
4. Adjuntar PEM de certificado y clave; guardar.
5. Emitir una **Factura C** de prueba desde **Nueva factura**.

Validar tablas `DocTipo` / montos con la normativa vigente antes de producción.
