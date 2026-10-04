# DESIGN.md · índice

> Estilo inspirado en [mdxcn](https://www.mdxcn.dev/) y adaptado a índice.
> Los valores de este documento son los de `app/globals.css`. Si cambian allí, cambian aquí.
> Catálogo vivo: `/kit`.

## Overview

índice es una herramienta para ordenar marcadores, y su interfaz se lee como el índice de un libro técnico: papel casi blanco, tinta casi negra y un único rojo que marca lo importante. El lienzo (`background`, #fbfbfb) lleva tinta cálida (`foreground`, #232121) y casi nada más compite con ella.

La estructura la dan **marcos punteados** con una cruz `+` en cada esquina y una etiqueta en mono del tipo `[ recientes ]`, como las anotaciones de un plano. Los datos no se dibujan con gráficos de librería: se escriben con caracteres (`·░▒▓█` en el mapa de calor, `█░` en las barras), lo que mantiene la estética de terminal. La biblioteca se ordena de la A a la Z con puntos guía entre el nombre y el dominio, como el índice de un libro.

El rojo de acento (`primary`, #c21d03) es la única nota de color. Marca etiquetas, datos y la acción principal. Nunca rellena superficies grandes.

**Rasgos clave**
- Tinta cálida sobre papel casi blanco; en oscuro, papel casi negro y tinta clara. Mismos tokens, otros valores.
- Un solo color de acento, rojo, reservado para etiquetas, datos y la acción principal.
- Marcos punteados con cruces en las esquinas como unidad de agrupación. Sin sombras.
- Geist Sans para el texto y Geist Mono para etiquetas, metadatos, atajos y botones.
- Gráficos con caracteres, no con librerías.
- Logo: un globo de líneas finas, inclinado, en color de acento. Es también el favicon.

## Colors

Tres capas, todas en `app/globals.css`:
1. **Primitivos** (`--palette-*`): la paleta en bruto. Solo los usa la capa semántica.
2. **Semánticos** (`--background`, `--primary`…): los únicos que usan los componentes. El modo oscuro solo redefine esta capa.
3. **Utilidades** de Tailwind generadas en `@theme inline` (`bg-background`, `text-primary`…).

### Primitivos

| Token | Valor | Origen |
|---|---|---|
| `--palette-primary-100` | #c21d03 | Paleta de Manuel |
| `--palette-primary-200` | #fd5732 | Paleta de Manuel |
| `--palette-primary-300` | #ffb787 | Paleta de Manuel |
| `--palette-accent-100` | #393939 | Paleta de Manuel |
| `--palette-accent-200` | #bebebe | Paleta de Manuel |
| `--palette-text-100` | #232121 | Paleta de Manuel |
| `--palette-text-200` | #4b4848 | Paleta de Manuel |
| `--palette-bg-100` | #fbfbfb | Paleta de Manuel |
| `--palette-bg-200` | #f1f1f1 | Paleta de Manuel |
| `--palette-bg-300` | #c8c8c8 | Paleta de Manuel |
| `--palette-gray-mute` | #777373 | Derivado: metadatos legibles (el salto entre #4b4848 y #bebebe era demasiado grande) |
| `--palette-gray-line` | #a3a0a0 | Derivado: líneas punteadas visibles (#c8c8c8 casi no se ve) |
| `--palette-gray-selected` | #e9e9e9 | Derivado: estado seleccionado |
| `--palette-dark-100/200/300` | #121111 · #191818 · #222020 | Derivados: negros cálidos del modo oscuro |
| `--palette-dark-mute` | #8f8b8b | Derivado: metadatos en oscuro |
| `--palette-dark-soft` | #5a2414 | Derivado: resaltado suave en oscuro |

### Semánticos

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `background` | bg-100 | dark-100 | Lienzo de la página |
| `foreground` | text-100 | bg-200 | Titulares y texto principal |
| `body` | text-200 | bg-300 | Texto de cuerpo |
| `muted-foreground` | gray-mute | dark-mute | Metadatos, labels, placeholders |
| `faint` | accent-200 | accent-100 | Solo decoración: puntos guía, celdas vacías, letras sin enlaces. **Nunca para texto que haya que leer** |
| `card` / `popover` | bg-100 | dark-100 / dark-200 | Superficies |
| `muted` / `accent` | bg-200 | dark-200 | Hover y fondos suaves |
| `secondary` | gray-selected | dark-300 | Estado seleccionado (pestañas, tema activo) |
| `primary` | primary-100 | primary-200 | Acento: etiquetas, datos, acción principal, foco |
| `primary-foreground` | bg-100 | dark-100 | Texto sobre el acento |
| `primary-soft` | primary-300 | dark-soft | Resaltado de coincidencias y selección de texto |
| `destructive` | primary-100 | primary-200 | Igual que el acento (ver abajo) |
| `border` / `input` | gray-line | text-200 | Líneas punteadas y bordes de campos |
| `ring` | primary-100 | primary-200 | Foco |
| `overlay` | rgb(35 33 33 / 0.35) | rgb(0 0 0 / 0.6) | Fondo de diálogos |

**Marcas de terceros.** Los colores oficiales de Google (`--color-google-red`, `-blue`, `-yellow`, `-green`) son tokens solo para su logo en el login. No se usan en ningún otro sitio.

**Peligro.** El acento ya es rojo, así que una acción destructiva no se distingue por el color: se distingue por el texto ("Borrar mi cuenta y todos mis datos"), por el estilo `destructive` (borde punteado, sin relleno) y por una confirmación explícita.

**Contraste.** `primary` sobre `background` y `primary-foreground` sobre `primary` superan 4,5:1 en los dos temas. `muted-foreground` también. `faint` no, y por eso no se usa para texto.

## Typography

**Geist Sans** para todo el texto y **Geist Mono** para etiquetas, metadatos, atajos y botones. Se cargan con `next/font` (variables `--font-geist-sans` y `--font-geist-mono`).

| Uso | Clases | Tamaño | Peso | Tracking |
|---|---|---|---|---|
| Display (titular principal) | `text-display font-medium tracking-display` | clamp(38px, 6.6vw, 66px) | 500 | -0.045em |
| Heading | `text-2xl font-medium tracking-heading` | 24px | 500 | -0.03em |
| Body | `text-sm` / `text-base` + `text-body` | 14–16px | 400 | 0 |
| Etiqueta de marco | `font-mono text-xs tracking-label text-primary` | 12px | 400 | 0.04em |
| Metadatos | `font-mono text-xs text-muted-foreground` | 12px | 400 | 0 |
| Label de campo, atajos | `font-mono text-2xs` | 11px | 400 | 0 |
| Botones | `font-mono text-xs` | 12px | 400 | 0 |

**Reglas**
- Mayúscula inicial en todo el texto: titulares, párrafos, botones, labels, tablas, navegación. Minúsculas solo en etiquetas técnicas en mono: `[ etiqueta ]` de los marcos, dominios, atajos (`esc`) y el badge `nuevo`.
- Nombres propios y siglas como corresponde: Chrome, Google, GitHub, URL, HTML.
- Frases completas. **Nunca la raya larga (—)**, ni símbolos decorativos (`§`), ni flechas o `·` dentro de frases. El `·` solo vale como separador de metadatos en mono (`ui.shadcn.com · Hace 2 d`).
- `tabular-nums` donde haya cifras en columna.

## Layout

- **Base 4px.** Se usa la escala de Tailwind (`1` = 4px): 4, 8, 12, 16, 24, 32, 48, 72.
- **Contenedor:** `max-w-5xl` centrado, con `px-5` de margen lateral.
- **Rejillas:** 2 columnas desde `md`, 1 en móvil. Los marcos anchos ocupan las dos (`md:col-span-2`).
- **Interior de un marco:** `px-6 pt-8 pb-6`.
- **Separación entre marcos:** `gap-6`.
- Nada desborda en horizontal a 375px; lo que pueda ser más ancho (mapa de calor) se desplaza dentro de su propio contenedor.

## Elevation & Depth

No hay sombras. La profundidad la dan:
1. El **borde punteado** (`border-dotted border-border`), que agrupa.
2. El **cambio de fondo** en hover (`accent`) y en selección (`secondary`).
3. El **desenfoque** de la barra superior fija (`bg-background/90 backdrop-blur-sm`).

## Shapes

| Token | Valor | Uso |
|---|---|---|
| `--radius` / `rounded-lg` | 4px | Controles: botones, inputs, pestañas |
| `rounded-sm` | 2px | Casillas, atajos, favicons |
| `rounded-full` | 9999px | Chips y puntos |
| Sin radio | 0 | Marcos |

## Motion

- Curva única: `ease-out-quint` (cubic-bezier(0.23, 1, 0.32, 1)).
- Hover y cambios de color: `duration-150`.
- Pulsar un botón: `active:scale-97`.
- Giro del logo al pasar el ratón: `duration-500`, -30°.
- Pulso del mapa: `animate-ping-soft` (2,4 s).
- Todo respeta `prefers-reduced-motion`.

## Components

Capas: `components/ui` (primitivos de shadcn adaptados) y `components/ds` (piezas propias de índice). Las variantes se definen con `cva` dentro del componente; `@shadcn/lint` impide cambiar su estilo desde fuera (solo se permite layout: márgenes, ancho, posición).

### `components/ui`
- **Button**: variantes `default` (relleno de acento), `outline` (borde punteado), `ghost`, `destructive` (borde punteado en rojo, sin relleno), `link`. Tamaños `default` (h-9), `sm` (h-7), `icon`. Texto en mono.
- **Input**: borde punteado; al enfocar pasa a sólido en acento.
- **Label**: variantes `field` (mono, discreta) e `inline` (para acompañar casillas).
- **Checkbox**: icono `CheckIcon` de Radix.
- **Tabs** + **TabsCount**: pestañas en mono; la activa con fondo `secondary` y contador en acento.
- **Kbd**: atajo con borde punteado; dentro de un botón principal toma el color del texto del botón.

### `components/ds`
- **Globe / Logo**: marca de índice. Tamaños `sm`, `md`, `lg`, `xl`.
- **Frame / FrameFooter**: marco punteado con cruces y etiqueta `[ … ]`.
- **GlyphHeatmap / GlyphHeatmapLegend**: mapa de calor de 7 filas por semana con `·░▒▓█`.
- **GlyphBars**: barras horizontales con `█░`.
- **IndexList / IndexEntry / IndexJump**: biblioteca A–Z con puntos guía y barra de letras. Ordena con las reglas del español (la Ñ después de la N, las tildes no separan).
- **SiteIcon**: favicon o, si no hay, la inicial.
- **ThemeToggle**: sistema, claro u oscuro. El tema se aplica antes de pintar (`lib/theme.ts`), sin parpadeo.

### Iconos
Solo **Radix Icons** (`@radix-ui/react-icons`, 15×15, `currentColor`). Excepciones: el globo (propio) y los logos oficiales de Google y GitHub en el login.

## Do's and Don'ts

### Do
- Usar solo tokens. Si falta un valor, añadirlo como token y documentarlo aquí.
- Agrupar con `Frame`, no con tarjetas con sombra.
- Reservar el acento para etiquetas, datos, foco y la acción principal.
- Escribir los datos con caracteres (`GlyphHeatmap`, `GlyphBars`).
- Comprobar cada pantalla en claro, oscuro y a 375px.

### Don't
- No usar colores de la paleta de Tailwind (`bg-zinc-50`) ni valores sueltos (`p-[13px]`): el lint lo bloquea.
- No rellenar superficies grandes con el acento.
- No usar `faint` para texto que haya que leer.
- No añadir sombras ni degradados.
- No usar la raya larga (—) ni separadores decorativos en los textos.
- No usar iconos de otras librerías.
