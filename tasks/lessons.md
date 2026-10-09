# Lecciones

Formato: corrección, causa, arreglo y regla. Solo correcciones reales de Manuel o tropiezos reales.

## 2026-10-04 · Respuestas en inglés
- **Corrección:** «respóndeme siempre en español».
- **Causa:** tras compactar la conversación, varias respuestas salieron en inglés.
- **Arreglo:** respuestas en español desde ese momento; guardado también en la memoria del agente.
- **Regla:** todo texto para Manuel en español, también avisos cortos y respuestas a capturas, y más aún justo después de compactar.

## 2026-10-04 · Afirmar en un texto legal algo que aún no es cierto
- **Corrección:** «luego desactivamos lo de IA, no lo afirmes aún».
- **Causa:** la política de privacidad decía que el entrenamiento de IA en Vercel estaba desactivado antes de que Manuel lo hiciera.
- **Arreglo:** frase retirada (`bc60a86`); queda como pendiente en `todo.md` y `docs/compliance.md`, para añadirla cuando esté hecho.
- **Regla:** las páginas legales solo describen el estado real y comprobado. Lo que depende de una acción pendiente va al plan, no al texto publicado.

## 2026-10-09 · Aviso flotante que se pierde con el fondo
- **Corrección:** «como es blanco el aviso se pierde un poco con el color de la app», además de pedirlo arriba y con mejor animación.
- **Causa:** el primer `Toast` copiaba el marco de los diálogos (`bg-background` y borde punteado). Sin overlay detrás ni sombras, flotando sobre la página no se distinguía.
- **Arreglo:** colores invertidos (`bg-foreground text-background`), etiqueta en `primary-soft`, contraste medido en los dos temas (`be80226`).
- **Regla:** un elemento que flota sobre la página sin overlay necesita un fondo distinto al de la página, en claro y en oscuro. Medir su contraste antes de enseñarlo y dar animación también a la salida.
