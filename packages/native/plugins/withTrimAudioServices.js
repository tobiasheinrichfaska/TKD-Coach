// Config plugin: strip the foreground-service <service> nodes that expo-audio injects.
//
// expo-audio's library manifest declares two foreground services — an `mediaPlayback`
// media-session/now-playing service and a `microphone` recording service. TKD-Coach only
// plays a one-shot foreground beep (RunSessionScreen) and never records audio or plays in
// the background, so neither service is ever started. Their mere declaration (a
// `foregroundServiceType` service) is what triggers Google Play's "this app uses a
// foreground service to play media/video in the foreground" review flag.
//
// These services live in the expo-audio LIBRARY manifest and are merged in at Gradle build
// time, so they never appear in the app manifest we edit here. To drop them we add
// `tools:node="remove"` override <service> entries (matched by fully-qualified name); the
// Android manifest merger then removes the library-declared services from the final APK.
// `android.blockedPermissions` (app.json) likewise strips the FOREGROUND_SERVICE_* /
// RECORD_AUDIO <uses-permission> lines, so the shipped manifest has no FGS surface at all.
const { withAndroidManifest } = require('expo/config-plugins');

// Fully-qualified service names (expo-audio namespace + the library-relative ".service.*").
const REMOVE_SERVICES = [
  'expo.modules.audio.service.AudioControlsService',
  'expo.modules.audio.service.AudioRecordingService',
];

module.exports = function withTrimAudioServices(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (!app) return cfg;
    app.service = app.service ?? [];
    for (const name of REMOVE_SERVICES) {
      const already = app.service.some((s) => s?.$?.['android:name'] === name);
      if (!already) {
        app.service.push({ $: { 'android:name': name, 'tools:node': 'remove' } });
      }
    }
    return cfg;
  });
};
