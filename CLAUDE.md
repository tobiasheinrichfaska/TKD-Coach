# CLAUDE.md — TKD-Coach

> Workspace-wide conventions: [`c:\skripte\private\general stuff\CLAUDE.md`](../../private/general%20stuff/CLAUDE.md)

---

## Development Ports

| Service | Port | Command |
|---|---|---|
| Expo Metro | 8082 | `npm start` |
| Web (if applicable) | (TBD) | (TBD) |

**Important:** Always use port 8082 for Expo in this project to avoid conflicts with other projects.

See workspace CLAUDE.md § Development Server Ports (Per-Project) for port strategy.

---

## Manual Tests

Human-tester instructions live in [`manual_tests/`](manual_tests/README.md): groups/athletes, sessions + timers, assessment, and the two-phone QR transfer. Keep them current when user-facing flows change.

---

## Notes

- The app uses the `@tobiasheinrichfaska/qr-sync` engine. Its canonical source lives in the separate [`expo-shared`](../expo-shared) repo, but for builds it is **vendored in-tree** at `packages/native/vendor/qr-sync` (the compiled `dist` + `package.json`) and consumed via `"file:./vendor/qr-sync"`. This is required so **EAS cloud builds** work — they upload only this repo, so an out-of-tree `file:` link to `expo-shared` would not resolve on the build server. Re-sync the vendor copy from `expo-shared` whenever qr-sync changes, until it is published to npm. Detailed app architecture: [`packages/native/CLAUDE.md`](packages/native/CLAUDE.md).

### Build (Android App Bundle)

- `eas.json` (in `packages/native`) defines a `production` profile that outputs an `app-bundle` (`.aab`); `appVersionSource` is `local`, so `version` / `android.versionCode` come from `app.json`.
- App id: `com.tobiasheinrich.tkdcoach`. Bump `android.versionCode` for every Play upload.
- Build (from `packages/native`, needs an Expo login): `eas login` → `eas init` → `eas build -p android --profile production`.

---

## Known Limitations

- **QR-Transfer receiver has no camera switch.** The receiver always uses the default camera; there is no front/back toggle yet. If scanning doesn't react, the wrong camera may be active. (Deferred — to add a switch button on `BidirectionalReceiverScreen`.)
- **QR sender advances chunks manually** (Previous/Next). There is no receiver→sender back-channel, so the sender pages through the chunk QRs at the receiver's pace by design.
- **qr-sync is vendored, not packaged.** `packages/native/vendor/qr-sync` is a copy of the `expo-shared` engine's `dist`. It must be **manually re-synced** when qr-sync changes, until the engine is published to npm and depended on by version.
- **No custom app icon yet.** Builds use Expo's default icon; a 1024×1024 icon + adaptive icon are needed before the Play listing goes live.

---

*Last updated: 2026-06-02 — vendored qr-sync in-tree for EAS builds; added eas.json (app-bundle) + versionCode; Versionshinweise; Known Limitations. Earlier (2026-05-31): relocated to public/; added manual_tests/.*
