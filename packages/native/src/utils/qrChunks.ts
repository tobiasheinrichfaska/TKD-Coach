import { inflate, deflate } from 'pako';
import { AppData } from '../types';

/**
 * Simple base64 encoder for React Native (no btoa available).
 */
function base64Encode(data: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < data.length) {
    const b1 = data[i++];
    const b2 = i < data.length ? data[i++] : 0;
    const b3 = i < data.length ? data[i++] : 0;

    const bitmap = (b1 << 16) | (b2 << 8) | b3;

    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < data.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < data.length ? chars.charAt(bitmap & 63) : '=';
  }

  return result;
}

/**
 * Simple base64 decoder for React Native (no atob available).
 */
function base64Decode(str: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const result: number[] = [];

  let i = 0;
  while (i < str.length) {
    const b1 = chars.indexOf(str[i++]);
    const b2 = chars.indexOf(str[i++]);
    const b3 = chars.indexOf(str[i++]);
    const b4 = chars.indexOf(str[i++]);

    const bitmap = (b1 << 18) | (b2 << 12) | ((b3 & 63) << 6) | (b4 & 63);

    result.push((bitmap >> 16) & 255);
    if (b3 !== 64) result.push((bitmap >> 8) & 255);
    if (b4 !== 64) result.push(bitmap & 255);
  }

  return new Uint8Array(result);
}

export interface QRChunk {
  id: string;
  total: number;
  index: number;
  data: string;
}

/**
 * Encode AppData to chunked QR-code JSON strings.
 * Returns array of JSON strings, each one a QRChunk.
 * Chunks are ~800 chars each to fit comfortably in QR codes.
 */
export function encodeToChunks(data: AppData): string[] {
  const json = JSON.stringify(data);
  const compressed = deflate(json);
  const b64 = base64Encode(compressed);

  const CHUNK_SIZE = 800;
  const chunks: string[] = [];
  const chunkId = Date.now().toString(36);
  const total = Math.ceil(b64.length / CHUNK_SIZE);

  for (let index = 0; index < total; index++) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, b64.length);
    const chunkData = b64.substring(start, end);

    const qrChunk: QRChunk = {
      id: chunkId,
      total,
      index,
      data: chunkData,
    };

    chunks.push(JSON.stringify(qrChunk));
  }

  return chunks;
}

/**
 * Decode scanned QR chunk packets back into AppData.
 * Expects array of JSON strings (from QR scans), assembles them, decompresses, and parses.
 */
export function assembleFromChunks(packets: string[]): AppData {
  const chunks = packets.map(p => JSON.parse(p) as QRChunk);

  // Sort by index
  chunks.sort((a, b) => a.index - b.index);

  // Concatenate all data parts
  const b64 = chunks.map(c => c.data).join('');

  // Decode base64
  const compressed = base64Decode(b64);

  // Decompress
  const json = inflate(compressed, { to: 'string' });

  // Parse
  const data = JSON.parse(json) as AppData;

  return data;
}

/**
 * Merge imported AppData into local AppData using local-wins strategy.
 * For each entity type: if ID exists locally, keep local; if new ID, add it.
 */
export function mergeAppData(local: AppData, imported: AppData): AppData {
  const localAthleteIds = new Set(local.athletes.map(a => a.id));
  const localGroupIds = new Set(local.groups.map(g => g.id));
  const localGameIds = new Set(local.games.map(g => g.id));
  const localPlanIds = new Set(local.sessionPlans.map(p => p.id));
  const localLogIds = new Set(local.sessionLogs.map(l => l.id));
  const localAssessmentIds = new Set(local.assessments.map(a => a.id));

  return {
    version: local.version,
    games: [
      ...local.games,
      ...imported.games.filter(g => !localGameIds.has(g.id)),
    ],
    athletes: [
      ...local.athletes,
      ...imported.athletes.filter(a => !localAthleteIds.has(a.id)),
    ],
    groups: [
      ...local.groups,
      ...imported.groups.filter(g => !localGroupIds.has(g.id)),
    ],
    sessionPlans: [
      ...local.sessionPlans,
      ...imported.sessionPlans.filter(p => !localPlanIds.has(p.id)),
    ],
    sessionLogs: [
      ...local.sessionLogs,
      ...imported.sessionLogs.filter(l => !localLogIds.has(l.id)),
    ],
    assessments: [
      ...local.assessments,
      ...imported.assessments.filter(a => !localAssessmentIds.has(a.id)),
    ],
  };
}
