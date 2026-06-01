/**
 * Adapter over the extracted engine `@tobiasheinrichfaska/qr-sync`, configured
 * for TKD-Coach's `AppData`. The transfer screens import the same names as before
 * (encodeToChunks / assembleFromChunks / exportSelected / detectChanges /
 * applyChanges + the QRChunk / ChangeDetection types) — only the implementation
 * moved out to the shared package.
 */
import {
  createSyncEngine,
  encodeToChunks as encodeToChunksGeneric,
  assembleFromChunks as assembleFromChunksGeneric,
} from '@tobiasheinrichfaska/qr-sync';
import type { ChangeDetection as GenericChangeDetection, QRChunk } from '@tobiasheinrichfaska/qr-sync';
import type { AppData, TransferSelection } from '../types';

/**
 * Every collection a transfer syncs (id-keyed). The single source of truth: the engine,
 * the receiver's review breakdown, and the import sanitizer all derive from this list.
 * `metricSchemas` are keyed by `type` (no id) so they're not id-mergeable — kept local.
 */
export const SYNCED_COLLECTIONS = [
  'games', 'groups', 'persons', 'sessionPlans', 'sessionLogs',
  'assessments', 'sessionTemplates', 'contactLinks', 'bodyParts', 'techniques',
] as const;
export type SyncedCollection = (typeof SYNCED_COLLECTIONS)[number];

const engine = createSyncEngine<AppData>({ collections: [...SYNCED_COLLECTIONS] });

/**
 * Trust boundary: assembled data comes from QR codes scanned off another phone's screen —
 * treat it as untrusted. Keep only synced-collection entries that are objects with a
 * non-empty string `id` (what the id-keyed merge relies on); drop anything malformed so a
 * garbage/partial QR can't inject ill-typed records that later crash selectors.
 */
export function sanitizeImported(data: AppData): AppData {
  const out = { ...data } as Record<string, unknown>;
  for (const key of SYNCED_COLLECTIONS) {
    const arr = out[key];
    if (Array.isArray(arr)) {
      out[key] = arr.filter(
        (e): e is { id: string } =>
          !!e && typeof e === 'object' && typeof (e as { id?: unknown }).id === 'string' && (e as { id: string }).id.length > 0
      );
    }
  }
  return out as unknown as AppData;
}

export type ChangeDetection = GenericChangeDetection<AppData>;
export type { QRChunk };

export function encodeToChunks(data: AppData): string[] {
  return encodeToChunksGeneric(data);
}

export function assembleFromChunks(packets: string[]): AppData {
  return assembleFromChunksGeneric<AppData>(packets);
}

/** Games + session templates are always shared (the shared library); the rest follow the coach's selection.
 *  Contact links ride along with persons (they're personal to them). */
export function exportSelected(data: AppData, selection: TransferSelection): AppData {
  return engine.exportSelected(data, { ...selection, games: true, sessionTemplates: true, bodyParts: true, techniques: true, contactLinks: selection.persons });
}

export function detectChanges(local: AppData, imported: AppData): ChangeDetection {
  return engine.detectChanges(local, imported);
}

export function applyChanges(local: AppData, changes: ChangeDetection): AppData {
  return engine.applyChanges(local, changes);
}
