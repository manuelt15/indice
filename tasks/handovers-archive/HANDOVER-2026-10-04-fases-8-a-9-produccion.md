# Handover · Fases 8, 8b y 9 · índice en producción · 2026-10-04

## Estado al cerrar

- `main` (`cb29a38`) desplegada en **https://indice-phi.vercel.app** (Vercel Hobby, proyecto `indice`, equipo de Manuel). Árbol limpio, sin ramas abiertas.
- F0 a F9 hechas. Quedan comprobaciones y tareas de Manuel (abajo). F10 (vídeo) pendiente por decisión de Manuel.

## Qué se hizo

**F8 · Landing y footer** (merge `e3cfdc0`)
- Revisado y commiteado el trabajo que otro agente dejó sin commit (`5a5554f`): landing, mapa CARTO con MapLibre vía `/api/map`, heatmap móvil en la semana actual, CSP con nonce y hash.
- `395313c`: `/api/map` solo sirve lo que usa nuestro mapa (2 estilos, sprites, fuentes, teselas hasta zoom 12) con `s-maxage` de una semana, para que nadie gaste el cupo de la clave; arreglado un 500 con origen `constructor` (`Object.hasOwn`); marco "recientes" de la landing con enlaces de ejemplo; en desarrollo la CSP permite estilos inline (Turbopack los inyecta sin nonce).
- `63f500e`: mapa del footer a 140px con la atribución debajo.

**F8b · Cumplimiento** (merge `9f9a6eb`)
- Migración 0006: `user.terms_accepted_at`; borra fotos de perfil y tokens OAuth antiguos. Tokens nuevos cifrados (`account.encryptOAuthTokens`) y sin foto (`mapProfileToUser`).
- Casilla obligatoria de 14 años y términos en la bienvenida; cuentas antiguas la aceptan una vez (`AcceptTerms`). `/entrar` enlaza términos y privacidad.
- `/privacidad`, `/terminos`, `/aviso-legal` (`components/ds/legal.tsx`, datos en `lib/legal.ts`), enlazadas en el footer.
- `/ajustes`: editar nombre y ciudad (`CityField` compartido con la bienvenida), descargar JSON (`/ajustes/exportar`), borrar cuenta escribiendo «borrar» (`lib/dal/account.ts`). `/cuenta-borrada`.
- `docs/compliance.md`: registro de tratamientos, encargados, retención, incidentes, checklist de MFA.
- Accesibilidad: `h1` en `/entrar`; `--palette-gray-mute` de #777373 a #6c6868 (4,15:1 a 4,53:1 sobre grises).
- Cerrar sesión como icono (`ExitIcon`).
- Privacidad ajustada a Vercel Hobby: no hay DPA con Vercel y se dice; compromiso de pasar a un plan con DPA si hay uso comercial.

**F9 · Deploy** (merges `b96a360` y `cb29a38`)
- `vercel.json`: funciones en `fra1`, cron diario `0 4 * * *` a `/api/cron/limpieza` (protegida con `CRON_SECRET`, `timingSafeEqual`), y `git.deploymentEnabled` solo para `main`.
- `lib/dal/maintenance.ts`: borra sesiones, códigos y límites de uso caducados.
- En producción, sin servicio de correo, `/entrar` solo ofrece Google y GitHub (`emailCodesEnabled` en `lib/auth.ts`).
- Quien no acepta los términos puede borrar su cuenta desde la bienvenida (`4330537`).
- Neon: rama `production` (la de siempre, datos reales) para Vercel; rama `desarrollo` (copia, sin auto-borrado) para local. `npm run db:migrate` y `npm run db:migrate:produccion` (`DB_TARGET` en `drizzle.config.ts`).
- README en español con captura de la landing clara y oscura (`docs/img/`, Chrome headless a 2x).

## Cómo se verificó

- Antes de cada merge: `npm run lint` (exit 0), `npm run typecheck` (exit 0), `npm test` (152/152 al final), `npm run build` (exit 0).
- Tests nuevos: borrado total sin filas de A en ninguna tabla y B intacto (`account.test.ts`), términos y ajustes (`profile.test.ts`), limpieza (`maintenance.test.ts`), proxy del mapa (`route.test.ts`, origen `constructor` incluido).
- Navegador con `prueba@indice.test` (borrado al final desde la propia app): casilla obligatoria, editar ciudad (footer actualizado), exportar JSON con `termsAcceptedAt`, borrar cuenta (sesión `null`, `/ajustes/exportar` 401, `/app` redirige), borrar desde la bienvenida sin aceptar.
- Producción: `/`, `/entrar`, legales 200; `/app` 307; `/ajustes/exportar`, `/api/favicon/*`, `/api/cron/limpieza` 401; tesela z15 404; `x-vercel-id` con `fra1`; HSTS, nosniff, `X-Frame-Options: DENY`, CSP; consola sin errores y cero peticiones a terceros; estado del deploy de `cb29a38` en GitHub: `success`.
- Manuel probó el login con Google y GitHub en producción.
- `.env.local`: comprobado con un script que solo imprime usuario y host que las 4 URLs conectan a la rama correcta.

## Pendiente

| Qué | Quién |
|---|---|
| Revisar el 5-10-2026 en Vercel (Logs, `/api/cron/limpieza`) que la limpieza de las 4:00 respondió 200 | Manuel, o agente con captura |
| Desactivar en Vercel el entrenamiento de IA con su contenido; después añadirlo a `/privacidad` (sección Vercel) | Manuel, luego agente |
| MFA en GitHub, Vercel, Neon, Google Cloud y CARTO; rama `main` protegida | Manuel |
| Preguntar al soporte de Neon el plazo de borrado de copias internas (la política dice «como máximo 30 días») | Manuel |
| F10: vídeo con onetake. Pedir permiso antes de instalar (lista en `todo.md`) | Agente con permiso de Manuel |
| Resend (códigos por correo en producción) y dominio `indice.dev` | Más adelante |

## Trampas

- **Neon:** la rama por defecto ya se llama `production` y el diálogo de rama nueva trae **Auto-delete: After 1 day** por defecto. Poner siempre *Never*.
- **Integración de Neon en Vercel:** no añadirla; crearía otra base de datos con el rol dueño.
- **Vercel:** las variables solo en Production; con previews activas cada push a una rama fallaba el build. Por eso `deploymentEnabled` solo para `main`.
- **Vercel Hobby no tiene DPA** (solo Pro y Enterprise) y puede usar el contenido para entrenar IA salvo que se desactive.
- **CARTO** exige clave desde septiembre de 2026: sin ella el mapa sale con marca de agua aunque responda 200.
- No ejecutar `npm run build` con `npm run dev` en marcha: el servidor de desarrollo se queda con rutas desfasadas (404). Reiniciarlo.
- El clasificador de permisos bloquea escribir en `.env.local` y en la base de datos con el rol dueño desde scripts: pedir a Manuel que edite el fichero en Cursor.
- Las herramientas MCP de Vercel de la sesión están conectadas a otra cuenta: no ven el proyecto de Manuel.
- Chrome headless hereda el modo oscuro del Mac: para capturas claras, `--blink-settings=preferredColorScheme=1`.
