# Plan de índice

> Página para que cualquier persona guarde y organice sus marcadores, con cuenta propia y privada.
> Estado: **planificación**. No se ha construido nada. Última actualización: 2026-10-03.
> Preview visual: https://claude.ai/artifact/H2iLStCWFxeGcyXBcDPUux (landing · entrar · bienvenida · app · /kit)

---

## 0. Decisiones (cerradas el 2026-10-04, salvo dominio y correo)

- [x] **Base de datos:** Postgres en Neon (plan gratis, región UE Frankfurt) con Drizzle. Row Level Security como segunda barrera.
- [x] **Repo:** `~/Developer/indice`, cuenta personal manuelt15, repo privado.
- [x] **Color de peligro:** opción 1. Rojo del acento más texto explícito y confirmación escribiendo "borrar".
- [x] **Clasificación:** solo reglas por palabras clave (gratis). IA opcional más adelante con tope de gasto.
- [x] **Geocodificación:** Photon (OpenStreetMap) desde el servidor al guardar, con lista de ciudades frecuentes de respaldo.
- [x] **Mapa:** CARTO plan gratis con atribución visible; límites a revisar en F8. En la app, mapa real con mapcn (no el esquema del preview).
- [x] **Hosting:** Vercel Hobby mientras sea gratis y personal; Pro si algún día es comercial.
- [x] **Skills:** instalar taste-skill y emilkowalski/skill en el repo.
- [x] **Titular legal:** Manuel Torres, persona física. Contacto: manueltorres1512@gmail.com. Sin dirección mientras no haya actividad económica.
- [x] **Región de datos:** UE (Neon Frankfurt, funciones de Vercel en `fra1`).
- [x] **Textos:** los del preview como base; se pulen en F8.
- [ ] **Dominio `indice.dev`:** pendiente.
- [ ] **Correo (Resend u otro):** pendiente. Hasta entonces, en desarrollo el código de login sale en consola; en producción hace falta antes de abrir a otras personas.

---

## 1. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Nombre | **índice** (dominio previsto `indice.dev`, sin tilde) |
| Logo y favicon | Globo de líneas finas (meridianos y paralelos inclinados) en color de acento. El mismo SVG es el favicon de la pestaña (`app/icon.svg`) |
| Estilo | Basado en el artifact "Marcadores · Terminal", inspirado en mdxcn y adaptado. Crédito "estilo inspirado en mdxcn" en el footer y en DESIGN.md |
| Paleta | La de Manuel (ver §3), con derivados documentados |
| Tipografía | Geist Sans y Geist Mono |
| Iconos | Radix Icons (`iconLibrary: "radix"` en shadcn). Si falta uno, se dibuja en su rejilla de 15×15 y se añade al sistema |
| Stack | Next.js 16, React 19, TypeScript, Tailwind 4, shadcn, zod, vitest; despliegue en Vercel |
| Lint | `@shadcn/lint` con ESLint: no-restyle, no-raw-colors, no-arbitrary-values, no-inline-styles, no-unknown-classes, require-static-classes |
| Skills | taste-skill (diseño) y emilkowalski/skill (animación) |
| Cuentas | Una por usuario y privada por defecto. Sin perfiles públicos |
| Login | **Better Auth** con Google, GitHub y código de 6 dígitos por correo (no enlace mágico) |
| Onboarding | Bienvenida y resumen, nombre y ciudad (opcional) e importar de Chrome o empezar vacío |
| Personalización | "hola, {nombre}" en la app; mapa de su ciudad en el footer (solo lo ve el usuario) |
| Footer | Mapa pequeño (~280px, cuadrado) con mapcn, cargado solo al aparecer en pantalla. En la landing pública: "hecho en madrid" |
| Favicons de enlaces | Los originales de cada web, descargados por nuestro servidor y cacheados. **No** con el servicio de Google: le revelaría qué webs guarda cada usuario |
| Mis 43 enlaces | Entran por la importación de Chrome en mi cuenta, nunca en el código |

---

## 2. Arquitectura

### Capas (dependencias en un solo sentido, de arriba abajo)
```
app/            rutas finas: solo componen, sin estilos propios
features/       bookmarks · import · search · auth · onboarding (lógica + UI del dominio)
components/ds/  sistema "terminal": Frame, Label, Globe, GlyphBars, Heatmap, IndexList, Kbd, CommandBox, MiniMap
components/ui/  primitivos shadcn, variantes con cva
lib/            dal (acceso a datos, solo servidor) · validación zod · utilidades
```
- Variantes con `cva` dentro del componente; `no-restyle` impide cambiarles el estilo desde fuera.
- `/kit` es el catálogo vivo de tokens y componentes, en claro y oscuro.

### Tokens (en `app/tokens.css`, expuestos con `@theme`)
- **Primitivos:** la paleta en bruto. Solo los usa la capa semántica.
- **Semánticos:** `--color-canvas`, `-surface`, `-hover`, `-selected`, `-ink`, `-body`, `-mute`, `-faint`, `-line`, `-accent`, `-on-accent`, `-accent-soft`, `-danger`, `-overlay`; `--radius-control`; `--space-*`; `--duration-*`, `--ease-*`; escala tipográfica.
- **De componente:** solo si hace falta (p. ej. `--frame-cross-size`).
- El modo oscuro solo cambia los tokens semánticos.

### Modelo de datos (borrador; depende de la base de datos)
- **User:** id, email, name, city, cityLat, cityLng (centro de la ciudad, nunca ubicación exacta), onboardedAt, createdAt.
- **Session / Account / Verification:** las gestiona Better Auth.
- **Category:** id, userId, name, slug, order. Única por (userId, slug).
- **Link:** id, userId, url, normalizedUrl, name, title, categoryId, tags[], pinned, faviconHost, createdAt. Única por (userId, normalizedUrl).
- **FaviconCache:** host, data, contentType, fetchedAt. Caché global y solo de servidor.
- **AiUsage:** userId, day, count (límite diario).

---

## 3. Diseño (base para DESIGN.md)

Estructura de DESIGN.md: igual que la guía de Vercel/Geist que pasó Manuel (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts).

### Paleta
| Token | Valor | Uso (claro) |
|---|---|---|
| primary-100 | #c21d03 | Acento: etiquetas `[ … ]`, datos, heatmap, botón principal |
| primary-200 | #fd5732 | Acento en modo oscuro |
| primary-300 | #ffb787 | Resaltado suave (coincidencias del buscador) |
| accent-100 | #393939 | Grises tenues en oscuro |
| accent-200 | #bebebe | Grises tenues: puntos guía, celdas vacías |
| text-100 | #232121 | Texto principal |
| text-200 | #4b4848 | Cuerpo; líneas en oscuro |
| bg-100 | #fbfbfb | Fondo de página |
| bg-200 | #f1f1f1 | Hover; texto principal en oscuro |
| bg-300 | #c8c8c8 | Cuerpo en oscuro |

**Derivados (no estaban en la paleta):**
- **Metadatos:** #777373.
- **Líneas punteadas:** #a3a0a0.
- **Seleccionado:** #e9e9e9.
- **Modo oscuro:** negros cálidos #121111, #191818 y #222020; texto apagado #8f8b8b; resaltado #5a2414.

### Rasgos del estilo
- **Marcos punteados** con cruces `+` en las esquinas y etiqueta mono `[ … ]` alineada a la izquierda.
- **Gráficos con caracteres:** heatmap `·░▒▓█`, barras `█░`.
- **Biblioteca de la A a la Z como índice de libro:** letras para saltar y puntos entre el nombre y el dominio.
- **Formas y profundidad:** radio de 4px solo en controles; sin sombras, la profundidad es el borde punteado.
- **Acento:** marca etiquetas, datos y la acción principal; nunca fondos grandes.
- **Mayúsculas:** mayúscula inicial en todo el texto (titulares, párrafos, botones, labels, tablas, navegación). Minúsculas solo en etiquetas técnicas en mono: `[ etiqueta ]` de los marcos, dominios, atajos (`esc`) y el badge `nuevo`. Nombres propios siempre con mayúscula (Chrome, Google, GitHub, URL, HTML).
- **Iconos:** solo Radix Icons exactos del paquete oficial (15×15, `currentColor`). Excepciones: el logo del globo (propio) y los logos de marca en el login, que van con su versión oficial (la «G» de cuatro colores de Google y el Octocat de GitHub).
- **Textos:** frases completas, **nunca la raya larga (—)**, sin símbolos decorativos como `§`, sin flechas `→` ni separadores `·` dentro de la prosa. Los separadores solo valen en metadatos en mono (`ui.shadcn.com · Hace 2 d`, coordenadas).
- **Contraste:** nada de texto en `--color-faint`; los atajos (`kbd`) dentro de un botón principal usan `--color-on-accent`.
- **Animación contenida:** al pulsar, al abrir el buscador, el giro del logo y el pulso del mapa. Respeta `prefers-reduced-motion`.

---

## 4. Seguridad (obligatorio)

| Riesgo | Medida |
|---|---|
| Ver o editar datos de otro usuario | `lib/dal` único y `server-only`. Cada función lee la sesión y filtra por `userId`; editar o borrar usa `{id, userId}`. La comprobación va dentro de cada Server Action y ruta, no solo en el proxy |
| Contraseñas | No se guardan: OAuth y código por correo |
| Fuerza bruta del código | Caduca en 10 min, 5 intentos máximo, límite de envíos por correo e IP, guardado cifrado |
| XSS | zod en todas las entradas; solo URLs `http`/`https`; `rel="noopener noreferrer"`; CSP y cabeceras de seguridad |
| CSP con el script de tema | El script que aplica el tema antes de pintar (`lib/theme.ts`) es inline: la CSP debe permitirlo con hash o nonce, nunca con `unsafe-inline` |
| SSRF (favicons, títulos, geocodificación) | Bloqueo de IPs privadas y locales, timeout, límite de tamaño, sin redirecciones a hosts internos |
| HTML de importación malicioso | Límite de tamaño; se parsea sin renderizarlo nunca |
| IA | Sin herramientas; respuesta validada con esquema cerrado (categoría de una lista); límite diario por usuario |
| Secretos | Solo en variables de entorno de Vercel; ninguno en el cliente; revisar el diff antes de cada commit |
| Ubicación | Solo la ciudad y el centro de la ciudad; nunca GPS ni ubicación exacta; se puede borrar |
| RGPD | Exportar mis datos y borrar la cuenta con todo lo asociado |

**Tests obligatorios antes de cualquier deploy:**
- B recibe un 404 al pedir un enlace de A.
- Una URL `javascript:` se rechaza.
- Una IP interna se bloquea.
- Sin sesión no se llega a nada privado.
- El código caduca y se bloquea tras 5 intentos.
- `/security-review` sin hallazgos.

---

## 4b. Cumplimiento normativo

Referencia: [Vanta](https://www.vanta.com/), que automatiza más de 35 marcos (SOC 2, ISO 27001, GDPR, NIS2…). Vanta es de pago y está pensada para empresas que venden a otras empresas; para índice no hace falta contratarla. Usamos sus marcos como lista de comprobación. Esto es una guía técnica, no asesoría legal: si índice se vuelve comercial, conviene una revisión profesional.

### Lo que sí aplica (servicio en España/UE con datos personales)
- **RGPD + LOPDGDD (España).**
  - **Política de privacidad** en lenguaje claro: qué datos guardamos (email, nombre, ciudad, enlaces), para qué, cuánto tiempo y con quién.
  - **Base legal:** ejecución del servicio. Si algún día hay analítica o marketing, consentimiento aparte.
  - **Minimización:** solo lo necesario. La ciudad es opcional y nunca se pide ubicación exacta.
  - **Derechos:** exportar datos, rectificar (editar perfil) y suprimir (borrar la cuenta con todo). Ya están en el plan.
  - **Edad mínima:** 14 años en España; se declara al registrarse.
  - **Retención:** se borran sesiones caducadas, códigos usados y cuentas eliminadas (con sus copias de seguridad, en un plazo definido).
  - **Brechas de seguridad:** procedimiento para notificar a la AEPD en 72 h y avisar a los usuarios si hay riesgo alto.
  - **Registro de actividades de tratamiento:** un documento sencillo en el repo.
- **Encargados del tratamiento.**
  - **Quiénes son:** Vercel, la base de datos, el servicio de correo, el geocodificador, el proveedor de mapas y la IA, si la hay.
  - **Contratos:** aceptar su DPA (acuerdo de tratamiento de datos) y listarlos en la política de privacidad.
  - **Datos fuera de la UE:** para proveedores de EE. UU., comprobar que estén adheridos al EU-US Data Privacy Framework o usen cláusulas contractuales tipo. Elegir región UE cuando se pueda (p. ej. base de datos en Frankfurt).
- **Cookies (LSSI-CE / ePrivacy).**
  - Solo cookies técnicas (sesión), así que **no hace falta banner de consentimiento**. Se informa en la política.
  - Si se añade analítica, se usará una sin cookies o se pedirá consentimiento.
  - El mapa y los favicons se sirven desde nuestro servidor para no mandar datos del usuario a terceros desde el navegador.
- **Aviso legal (LSSI-CE).** Datos del titular, obligatorio si hay actividad económica. Lo preparamos igualmente.
- **Términos de uso.** Uso aceptable, sin garantías, posibilidad de cerrar cuentas abusivas.
- **Accesibilidad.** La European Accessibility Act exime a microempresas, pero seguimos WCAG 2.2 AA como norma de calidad: contraste, foco visible, teclado, `prefers-reduced-motion` y etiquetas en formularios.

### Controles de seguridad estilo SOC 2 / ISO 27001 (sin certificarnos)
- **MFA** en todas las cuentas de administración: GitHub, Vercel, base de datos, correo y dominio.
- **Mínimo privilegio:** nadie accede a la base de datos de producción desde su máquina; los secretos están separados por entorno.
- **Dependencias:** Dependabot o Renovate y `npm audit` en CI; ramas protegidas (nada directo a `main`).
- **Copias de seguridad** de la base de datos y una prueba de restauración al menos una vez.
- **Logs** de seguridad (inicios de sesión, intentos fallidos, borrado de cuenta) sin datos sensibles; nunca se registran códigos ni tokens.
- **Plan de incidentes** de una página: quién, cómo se revoca, cómo se avisa.

### Entregables
- `/privacidad`, `/terminos`, `/aviso-legal`, enlazados en el footer.
- `docs/compliance.md`: registro de tratamientos, lista de encargados con su DPA y región, política de retención y plan de incidentes.
- Casilla en el registro: "tengo 14 años o más y acepto los términos y la política de privacidad".

---

## 5. Fases

Cada fase se cierra solo cuando su criterio se cumple con evidencia (tests, lint, navegador).

- [x] **F0 · Decisiones.** Cerradas salvo dominio y correo (no bloquean F1–F7).
- [x] **F1 · Base.** Repo, Next.js 16.3, Tailwind 4, shadcn (`radix-nova`, iconos Radix), `@shadcn/lint` con las 6 reglas, vitest y skills. *Cerrada el 2026-10-04:* `lint`, `typecheck`, `test` y `build` en verde; `npm audit --omit=dev` sin vulnerabilidades (las de desarrollo vienen de `braces` en herramientas de build).
- [x] **F2 · Sistema de diseño.** DESIGN.md, tokens en 3 capas (`app/globals.css`), componentes `ui` adaptados y `ds` propios, `/kit`, logo y favicon del globo, tema claro/oscuro/sistema sin parpadeo. *Cerrada el 2026-10-04:* `/kit` revisado en claro, oscuro y a 375px sin desbordes ni errores de consola; lint sin excepciones; 11 tests.
- [x] **F3 · Datos, auth y seguridad.** Neon (Postgres 18, Frankfurt) con rol `indice_app` y RLS forzada; Better Auth con Google, GitHub y código; `lib/dal` con doble barrera; 30 tests (aislamiento A/B contra Postgres real en memoria, URLs `javascript:`); login por código probado de punta a punta; `/security-review` sin hallazgos. *Cerrada el 2026-10-04:* login real con Google y GitHub probado por Manuel.
- [ ] **F4 · Onboarding.** Bienvenida, nombre y ciudad (geocodificada en servidor) y primer paso. *Hecho cuando:* un usuario nuevo siempre lo ve y uno que lo completó nunca; nombre y ciudad salen en la app y en el footer.
- [ ] **F5 · App.** Resumen, biblioteca A–Z, categorías, ⌘K, pegar URL, fijar y borrar; favicons originales vía servidor con caché. *Hecho cuando:* el flujo completo está probado en el navegador.
  - **Pendiente de la revisión de seguridad de F3:** al aceptar `categoryId`, impedir enlazar con categorías de otro usuario (la FK `link.category_id` se comprueba sin RLS). Solución: FK compuesta `(user_id, category_id)` → `category(user_id, id)` o comprobación en `lib/dal`, con test de aislamiento.
- [ ] **F6 · Importar de Chrome.** Parser del HTML de marcadores y eliminación de duplicados. *Hecho cuando:* hay un test con un export real y mis 43 enlaces están dentro de mi cuenta.
- [ ] **F7 · Clasificación.** Reglas por palabras clave y, si se decide, IA con límite. *Hecho cuando:* clasifica bien y funciona sin IA.
- [ ] **F8 · Landing y footer.** Landing pública con datos de ejemplo y mapa mapcn pequeño. *Hecho cuando:* está revisada en móvil y escritorio, claro y oscuro, sin errores en consola.
- [ ] **F8b · Cumplimiento.** Páginas legales, `docs/compliance.md`, DPAs aceptados, MFA en cuentas de administración y revisión WCAG 2.2 AA (ver §4b). *Hecho cuando:* todos los entregables de §4b existen, los encargados están listados con región y DPA, y el flujo de borrado de cuenta elimina todos los datos (con test).
- [ ] **F9 · Deploy.** Preview en Vercel; producción **solo con confirmación de Manuel**. *Hecho cuando:* la URL de preview funciona, pasan los tests y la `/security-review`, y **F8b está cerrada**.
- [ ] **F10 · Vídeo de lanzamiento (al terminar todo).** Probar la skill [onetake](https://github.com/feitangyuan/onetake), que genera vídeos de producto en una sola toma con movimiento continuo de cámara.
  - **Funcionamiento:** es local y no usa APIs de pago. Necesita Python 3 (playwright, numpy, scipy, Pillow, matplotlib, opencv), ffmpeg y node.
  - **Licencia:** PolyForm Noncommercial. Vale para uso personal; si índice llegara a ser comercial, el vídeo no podría usarse así.
  - **Hecho cuando:** hay un vídeo de ~15 s de índice revisado por Manuel.

---

## 6. Referencias

**Artifacts de referencia**
- Marcadores · Terminal: https://claude.ai/artifact/XjeAZA8qCobbSacG1rsNEs
- Marcadores · Dashboard: https://claude.ai/artifact/VDLsgxfBSTnp7hGJdf6nKw

**Componentes y lint**
- shadcn/ui: https://ui.shadcn.com
- @shadcn/lint: https://github.com/shadcn-ui/lint
- mapcn: https://mapcn.vercel.app (MapLibre; mapa base por defecto sin API key)
- Radix Icons: https://www.radix-ui.com/icons

**Descartado**
- Geist Icons: sin licencia para uso fuera de Vercel.
