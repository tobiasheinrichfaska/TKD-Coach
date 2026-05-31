# CLAUDE.md — TKD-Coach

> Workspace-wide conventions: [`c:\skripte\private\general stuff\general_stuff_claude.md`](../../private/general%20stuff/general_stuff_claude.md)

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

- The app consumes `@tobiasheinrichfaska/qr-sync` (QR sync engine) from the separate [`expo-shared`](../expo-shared) repo via a local `file:` link — both repos must sit side-by-side under `c:\skripte\public\`. Not yet on a registry (see README build note). Detailed app architecture: [`packages/native/CLAUDE.md`](packages/native/CLAUDE.md).

---

*Last updated: 2026-05-31 — relocated to public/; added manual_tests/; consumes qr-sync from expo-shared.*
