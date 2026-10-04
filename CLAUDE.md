@AGENTS.md

# índice

Web para guardar y ordenar marcadores, con cuenta propia y privada. Plan completo, decisiones y fases en `tasks/todo.md`; leerlo antes de proponer trabajo. Maqueta de referencia: `docs/preview/indice-preview.html`.

## Reglas del proyecto
- **Tokens siempre.** Nada de colores, tamaños ni espacios sueltos: `@shadcn/lint` lo bloquea. Si falta un valor, se añade como token en `app/globals.css` y se documenta en `DESIGN.md`.
- **Capas:** `app/` (rutas finas, sin estilos propios) → `features/` → `components/ds/` → `components/ui/` → `lib/`. Las variantes van con `cva` dentro del componente.
- **Iconos:** solo Radix (`@radix-ui/react-icons`). Excepciones: el logo del globo y los logos oficiales de Google y GitHub en el login.
- **Textos:** en español, mayúscula inicial, frases completas. Nunca la raya larga (—), ni `§`, ni flechas o `·` dentro de frases.
- **Datos:** todo acceso a la base de datos pasa por `lib/dal` (solo servidor) y filtra por el usuario de la sesión.
- **Seguridad y cumplimiento:** ver §4 y §4b de `tasks/todo.md` y la sección 13 del CLAUDE.md global.

## Comandos
- `npm run dev` (puerto 3100), `npm run lint`, `npm test`, `npm run typecheck`, `npm run build`
- Base de datos: `npm run db:generate` (nueva migración), `npm run db:migrate` (aplicar con el rol dueño), `npm run db:setup` (primera vez: migra y crea la conexión de `indice_app`)
- Neon tiene dos ramas: `production` (la usa Vercel, `DATABASE_URL_PRODUCCION`) y `desarrollo` (la usa local, `DATABASE_URL`). Una migración nueva se aplica primero en desarrollo (`npm run db:migrate`) y, tras probarla, en producción (`npm run db:migrate:produccion`).
- No ejecutar `npm run build` con `npm run dev` en marcha: el servidor de desarrollo se queda con rutas desfasadas (404). Si pasa, reiniciarlo.
- En desarrollo, el código de acceso por correo sale en la consola del servidor.
- Una fase solo se cierra con `lint`, `typecheck`, `test` y `build` en verde.
