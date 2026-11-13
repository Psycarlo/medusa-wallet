const ExpoEnvironment = require('jest-expo/src/preset/nativeEnvironment')

/**
 * jest-expo replaces the global `fetch` with Expo's native fetch, which only
 * has stubs under Jest. Keep a reference to Node's fetch so tests that talk
 * to the real APIs can use it (see tests/setup.js).
 */
class Environment extends ExpoEnvironment {
  constructor(config, context) {
    super(config, context)
    this.global.__NODE_FETCH__ = this.global.fetch
  }
}

module.exports = Environment
