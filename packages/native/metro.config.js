const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo setup: watch the workspace root so Metro sees all packages.
// Also watch the real path of @tobiasheinrichfaska/qr-sync — it's consumed via a
// local `file:` dependency whose target (the expo-shared repo) lives OUTSIDE this
// repo, so Metro must watch it to resolve/bundle it. Resolved via the symlink so
// the sibling-repo location isn't hardcoded. (Local-consumption-for-now; drops out
// once qr-sync is installed from a registry.)
let qrSyncRoot = null;
try {
  qrSyncRoot = path.dirname(require.resolve('@tobiasheinrichfaska/qr-sync/package.json'));
} catch {
  // package not linked yet — fall back to workspace-only
}
config.watchFolders = qrSyncRoot ? [workspaceRoot, qrSyncRoot] : [workspaceRoot];

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
