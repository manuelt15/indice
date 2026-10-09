# Handover · Avisos al guardar y al borrar un enlace · 2026-10-09

## Estado al cerrar

- `main` (`ee5064b`) desplegada en **https://indice-phi.vercel.app**. Vercel marcó los dos deploys de hoy como «Deployment has completed» (estado del commit en GitHub). En producción no se ha probado a mano; solo en local.
- Ramas `feat/avisos-marcadores` y `feat/aviso-arriba` integradas y borradas (local y GitHub). Solo queda `main`.
- Sin cambios pendientes, salvo la carpeta `.agents/` sin seguimiento, que ya estaba y no es de esta sesión.

## Qué se hizo

Manuel notó que al añadir un marcador no salía ninguna confirmación. Revisado también el borrado: la confirmación **antes** de borrar ya existía (la papelera muestra «Borrar» y «No» en la misma fila, visibles mientras se decide gracias a `has-data-confirming`), pero no había aviso **después**.

**`c1f1022` (merge `1595284`): aviso al guardar y al borrar**
- Nuevo `components/ds/toast.tsx` (`Toast`, tipo `ToastMessage`), sin dependencias nuevas.
- `LibraryProvider` guarda el aviso y expone `notify(text, tone)`. Vive en el proveedor para que el aviso siga visible aunque la fila borrada desaparezca al refrescar.
- `AddLinkDialog` recibe `onSaved(name)`: «"Nombre" se ha guardado en tu índice.».
- `LinkActions`: al borrar, «"Nombre" se ha borrado de tu índice.». Si la acción falla (también al fijar), muestra el error con etiqueta `[ error ]`. Antes el error se ignoraba en silencio.
- Se va solo a los 4 s (`TOAST_MS`). Región `role="status"` siempre montada para que el lector de pantalla lo anuncie.

**`be80226` (merge `ee5064b`): arriba, con animación y colores invertidos** (a petición de Manuel)
- Posición `top-20`, la misma altura que los diálogos, bajo la cabecera fija.
- Entrada: fundido, `zoom-in-95` y `slide-in-from-top-3` en `duration-250`. Salida: fundido y `slide-out-to-top-2` en `duration-150`. Antes desaparecía de golpe. `Toast` conserva el último aviso (`shown`) hasta `onAnimationEnd` de la salida y entonces se desmonta. Con reduced-motion la regla global deja las animaciones en 0,01 ms y `animationend` sigue disparándose.
- Colores invertidos (`bg-foreground text-background`): destaca sin sombra, como pide DESIGN.md. Etiqueta `[ hecho ]` o `[ error ]` en `text-primary-soft`. Contraste WCAG: claro 15,5 (texto) y 9,4 (etiqueta); oscuro 16,7 y 11,0. En oscuro la etiqueta se ve marrón (`--palette-dark-soft`); el rojo vivo no llega a 4,5 sobre fondo claro.
- DESIGN.md: Toast en la lista de `components/ds` y su animación en Motion.

## Cómo se verificó

- `npm run lint` («ESLint: No issues found»), `npm run typecheck`, `npm test` (21 ficheros, 152 tests) y `npm run build` («Compiled successfully») en verde en los dos cambios.
- Navegador en local con un usuario de prueba (`prueba-avisos@indice.test`, borrado al final desde Ajustes): añadir `https://example.com` muestra el aviso de guardado; borrar con confirmación muestra el de borrado; en modo claro y oscuro.
- Ciclo medido con un MutationObserver: `open` al aparecer, `closed` a los ~4,0 s, desmontado 166 ms después.
- Consola: solo un 404 de `/api/favicon/example.com` (example.com no tiene favicon; esperado).

## Pendiente

- Lo mismo que antes, sin cambios (ver `todo.md`): MFA y DPAs (F8b), IA de Vercel, Neon, `BETTER_AUTH_URL` estable y revisar el cron de limpieza (F9), dominio y correo, F10 (vídeo). Todo depende de Manuel.
- Detalle menor sin arreglar: el aviso de borrado sale en cuanto responde la acción, y la fila puede seguir visible un instante hasta que termina `router.refresh()` (se nota en desarrollo, que es más lento).

## Trampas

- **gh tenía activa la cuenta de trabajo**. Se cambió con `gh auth switch -u manuelt15`; el cambio es global en el Mac. El llavero de macOS ya guardaba `manuelt15` (id 195821676) y el email local del repo es `manueltorres1512@gmail.com`, confirmado por Manuel como el de su GitHub personal.
- **`preview_start` por nombre falla** si la sesión se abrió en otra carpeta: busca `.claude/launch.json` en la carpeta original. Arrancar `npm run dev` en segundo plano y abrir el navegador con `preview_start` y la URL `http://localhost:3100/...`.
- Parar el servidor de desarrollo antes de `npm run build` (regla del CLAUDE.md del proyecto).
