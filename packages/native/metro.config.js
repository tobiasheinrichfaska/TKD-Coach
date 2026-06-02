const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo setup: watch the workspace root so Metro sees all packages. qr-sync is now
// vendored in-tree (packages/native/vendor/qr-sync, a `file:` dep), so no out-of-tree
// watch folders or custom resolvers are needed — it resolves like any local package.
config.watchFolders = [workspaceRoot];

// Resolve modules from local node_modules first, then workspace root.
// This makes packages/native/node_modules/react (19.1.0) win over any root copy.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Allow .cjs files
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

module.exports = config;
