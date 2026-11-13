/**
 * `https://lnbits.example.com/ ` -> `https://lnbits.example.com`. API paths
 * are appended to it, and servers answer `//api/...` with a 404.
 */
function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, '')
}

/** `https://lnbits.example.com/path` -> `lnbits.example.com` */
function getHost(url: string) {
  return normalizeBaseUrl(url)
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .split(/[/?#]/)[0]
}

export { getHost, normalizeBaseUrl }
