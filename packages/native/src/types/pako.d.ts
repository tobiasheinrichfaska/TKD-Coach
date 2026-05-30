/**
 * Minimal type declarations for `pako` consumed by `utils/qrChunks.ts`.
 * Replace with @types/pako if it gets added to dependencies.
 */
declare module 'pako' {
  export function deflate(data: string | Uint8Array): Uint8Array;
  export function inflate(data: Uint8Array, options: { to: 'string' }): string;
  export function inflate(data: Uint8Array): Uint8Array;
}
