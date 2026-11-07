const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Metro fingerprints each asset by its contents, so an OTA update invalidates a changed image.

module.exports = withNativewind(config);
