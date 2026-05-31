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
  collections: ['games', 'groups', 'athletes', 'sessionPlans', 'sessionLogs', 'assessments', 'sessionTemplates'],
});

export type ChangeDetection = GenericChangeDetection<AppData>;
export type { QRChunk };

export function encodeToChunks(data: AppData): string[] {
  return encodeToChunksGeneric(data);
}

export function assembleFromChunks(packets: string[]): AppData {
  return assembleFromChunksGeneric<AppData>(packets);
}

/** Games + session templates are always shared (the shared library); the rest follow the coach's selection. */
export function exportSelected(data: AppData, selection: TransferSelection): AppData {
  return engine.exportSelected(data, { ...selection, games: true, sessionTemplates: true });
}

export function detectChanges(local: AppData, imported: AppData): ChangeDetection {
  return engine.detectChanges(local, imported);
}

export function applyChanges(local: AppData, changes: ChangeDetection): AppData {
  return engine.applyChanges(local, changes);
}
