// Restore Node's fetch (saved by tests/environment.js) for API tests
if (globalThis.__NODE_FETCH__) {
  Object.defineProperty(globalThis, 'fetch', {
    value: globalThis.__NODE_FETCH__,
    writable: true,
    configurable: true
  })
}
