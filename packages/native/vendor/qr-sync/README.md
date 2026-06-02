# @tobiasheinrichfaska/qr-sync

Pure-TypeScript **QR peer-to-peer data-sync engine**. No React, no native deps — runs anywhere (React Native / Expo Go, Node, web).

Two devices sync offline by showing/scanning QR codes: the sender serializes selected data → deflate → base64 → chunked QR codes; the receiver scans them, reassembles, and reviews **new / changed / unchanged** before merging.

## API

```ts
import { createSyncEngine, encodeToChunks, assembleFromChunks } from '@tobiasheinrichfaska/qr-sync';

interface AppData {
  version: number;
  groups: { id: string; name: string }[];
  athletes: { id: string; name: string }[];
}

const engine = createSyncEngine<AppData>({
  collections: ['groups', 'athletes'], // keys of AppData that are arrays of { id }
});

// Sender:
const payload = engine.exportSelected(data, { groups: true, athletes: true });
const qrStrings = encodeToChunks(payload);          // render each as a QR code

// Receiver:
const imported = assembleFromChunks<AppData>(scannedPackets);
const changes = engine.detectChanges(localData, imported);   // { new, changed, unchanged }
const merged  = engine.applyChanges(localData, changes);     // replace-by-id + append new
```

- `encodeToChunks(data, chunkSize?)` / `assembleFromChunks(packets)` — schema-agnostic transport.
- `createSyncEngine<T>({ collections })` — `exportSelected`, `detectChanges`, `applyChanges` over your `{ id }` collections. Non-collection fields (e.g. `version`) are carried from local untouched.

## Develop

```bash
npm test          # ts-jest unit tests
npm run build     # → dist/ (CommonJS + .d.ts)
```

Licensed AGPLv3 + commercial — see the repo root.
