const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// pako ESM/CJS resolution workaround
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

// Allow .cjs files
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

module.exports = config;
