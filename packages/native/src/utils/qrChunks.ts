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

const engine = createSyncEngine<AppData>({
  // metricSchemas are keyed by `type` (no id) so they're not id-mergeable — kept local, not synced.
  collections: ['games', 'groups', 'persons', 'sessionPlans', 'sessionLogs', 'assessments', 'sessionTemplates', 'contactLinks', 'bodyParts', 'techniques'],
});

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
