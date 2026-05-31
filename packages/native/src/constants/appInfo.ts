import appJson from '../../app.json';

/**
 * Single source of truth for app identity shown in the UI (About section).
 * Version is read live from app.json so it never drifts from the build.
 */
export const APP_INFO = {
  name: 'TKD-Coach',
  version: appJson.expo.version,
  tagline: 'Neuroathletik-Trainingsbegleiter',
  author: 'Tobias Heinrich',
} as const;
