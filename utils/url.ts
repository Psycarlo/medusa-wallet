/**
 * `https://lnbits.example.com/ ` -> `https://lnbits.example.com`. API paths
 * are appended to it, and servers answer `//api/...` with a 404.
 */
function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, '')
}

export { normalizeBaseUrl }
