# Cumplimiento de índice

Documento interno. Guía técnica, no asesoría legal. Marcos de referencia usados como lista de comprobación: RGPD, LOPDGDD, LSSI-CE y controles al estilo SOC 2 / ISO 27001 (ver vanta.com). Si índice se vuelve comercial, conviene una revisión profesional.

Última revisión: 4 de octubre de 2026.

## 1. Registro de actividades de tratamiento (art. 30 RGPD)

| Campo | Contenido |
|---|---|
| Responsable | Manuel Torres, persona física. Contacto: manueltorres1512@gmail.com |
| Finalidad | Prestar el servicio de guardar y ordenar enlaces de cada persona usuaria; seguridad del servicio |
| Base legal | Ejecución del contrato (art. 6.1.b) para cuenta, perfil y enlaces. Interés legítimo (art. 6.1.f) para IP y límites de uso |
| Interesados | Personas usuarias de 14 años o más |
| Categorías de datos | Correo, nombre, proveedor de acceso (Google, GitHub o código), ciudad opcional (nombre, país, centro redondeado a ~1 km), enlaces (URL, nombre, título, categoría, tags, fijado, fechas), IP y navegador de la sesión, aceptación de términos con fecha |
| Datos que no se guardan | Contraseñas, foto de perfil, datos de pago, ubicación exacta, categorías especiales. Los tokens de Google y GitHub se guardan cifrados (y los anteriores se borraron en la migración 0006) |
| Destinatarios | Solo encargados del apartado 2. Sin cesiones a terceros |
| Transferencias internacionales | Vercel y Neon son empresas de EE. UU. adheridas al EU-US Data Privacy Framework; los datos se procesan y almacenan en Frankfurt |
| Plazos | Apartado 3 |
| Medidas de seguridad | Apartado 4 |

## 2. Encargados del tratamiento

| Proveedor | Para qué | Región de los datos | Garantía | DPA |
|---|---|---|---|---|
| Vercel Inc. | Alojamiento y funciones | Frankfurt (`fra1`) | Data Privacy Framework (certificado) | **Solo en Pro y Enterprise** (vercel.com/legal/dpa, vigente desde el 31-3-2026: «applies … for Customers who are on Enterprise and Pro plans»). En Hobby no hay DPA, el uso debe ser personal o no comercial y Vercel puede usar el contenido para entrenar IA salvo que se desactive en los ajustes del equipo. **Decidir antes de abrir a otras personas: pasar a Pro.** |
| Neon (Databricks) | Base de datos Postgres | AWS Frankfurt (`eu-central-1`) | Data Privacy Framework | Incluido automáticamente en sus términos para todos los clientes, también el plan gratis. Copia firmable en neon.com/dpa; subencargados en neon.com/subprocessors |
| Google / GitHub | Inicio de sesión, solo si la persona lo elige | Sus regiones | Data Privacy Framework | La persona usuaria es cliente directa suya; índice solo recibe correo y nombre |
| Servicio de correo (pendiente, previsiblemente Resend) | Enviar códigos de acceso | Elegir región UE si existe | Por decidir | **Aceptar DPA y añadirlo a la política de privacidad antes de activarlo** |

Servicios consultados desde el servidor sin datos identificativos (no son encargados, pero se informan en la política):

| Servicio | Qué recibe |
|---|---|
| Photon de komoot (Alemania) | El texto que se escribe al buscar ciudad |
| CARTO (mapas) | La zona del mapa que se muestra (la ciudad), con la clave de índice |
| Cada web guardada | La petición de su favicon y de su título, desde la IP del servidor |

## 3. Retención

| Dato | Plazo |
|---|---|
| Cuenta, perfil, enlaces, categorías | Mientras exista la cuenta |
| Sesiones | 30 días desde el último uso (Better Auth). Las caducadas quedan en la tabla hasta que se limpien: **añadir limpieza periódica en F9** (cron de Vercel) |
| Códigos de acceso | 10 minutos, guardados con hash |
| Límites de uso (IP) | Ventana de 1 a 10 minutos; la fila se reutiliza |
| Caché de favicons | 7 días; no contiene datos de personas |
| Cuenta borrada | Al momento en la base de datos (`deleteAccount`, con test). Historial de restauración de Neon: 6 horas en el plan gratis (7 días en Launch, 30 en Scale). Neon no publica cuánto guarda en copias internas: la política dice «como máximo 30 días», pendiente de confirmar con su soporte |

## 4. Medidas de seguridad

- Sin contraseñas: OAuth y código por correo (6 dígitos, hash, 10 minutos, 5 intentos, 3 envíos cada 10 minutos).
- Aislamiento por persona: `lib/dal` filtra por usuario y Postgres aplica Row Level Security forzada con un rol sin privilegios de dueño. Tests A/B en `lib/dal/*.test.ts`.
- Validación con zod de todas las entradas; solo URLs http/https.
- Protección SSRF en todo lo que descarga el servidor (`lib/net/safe-fetch.ts`).
- CSP con nonce y hash, cabeceras de seguridad (HSTS, nosniff, frame-ancestors), favicons SVG servidos en sandbox.
- Tokens OAuth cifrados; secretos solo en variables de entorno; `.env*` fuera de git.
- Logs sin códigos ni tokens (en desarrollo el código se muestra en la consola local, nunca en producción).

## 5. Derechos de las personas

| Derecho | Cómo |
|---|---|
| Acceso y portabilidad | Ajustes, "Descargar mis datos" (JSON) |
| Rectificación | Ajustes, perfil (nombre y ciudad) |
| Supresión | Ajustes, "Borrar mi cuenta y todos mis datos" escribiendo «borrar» |
| Oposición, limitación, dudas | Correo al responsable; respuesta en menos de un mes |

## 6. Brechas e incidentes

1. **Detectar y contener:** revocar el secreto afectado (rotar `BETTER_AUTH_SECRET` invalida todas las sesiones; rotar la contraseña de `indice_app` con `npm run db:setup`; regenerar claves de OAuth y CARTO).
2. **Evaluar:** qué datos, cuántas personas, desde cuándo. Guardar evidencias (logs de Vercel y Neon).
3. **Notificar a la AEPD en 72 horas** desde que se conoce, si hay riesgo para las personas (sede.aepd.gob.es).
4. **Avisar a las personas afectadas** sin demora si el riesgo es alto, con lo ocurrido y qué hacer.
5. **Registrar** el incidente aquí debajo aunque no se notifique.

Registro de incidentes: ninguno.

## 7. Controles de cuentas de administración (Manuel)

- [ ] MFA en GitHub (`manuelt15`).
- [ ] MFA en Vercel.
- [ ] MFA en Neon.
- [ ] MFA en Google Cloud (cliente OAuth).
- [ ] MFA en CARTO.
- [ ] MFA en el servicio de correo cuando se elija.
- [ ] Rama `main` protegida en GitHub (sin push directo, con revisión).
- [ ] Dependabot activado (ya avisa de vulnerabilidades en el push).
- [ ] Copia de seguridad restaurada al menos una vez (Neon permite crear una rama desde un punto en el tiempo).
