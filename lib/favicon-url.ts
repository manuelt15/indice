/**
 * Versión de los favicons. Subirla invalida lo que los navegadores guardaron
 * (por ejemplo, un 404 de antes de arreglar una descarga).
 */
const FAVICON_VERSION = 2

/** URL de nuestro proxy de favicons para un dominio. */
export function faviconSrc(host: string): string {
  return `/api/favicon/${encodeURIComponent(host)}?v=${FAVICON_VERSION}`
}
