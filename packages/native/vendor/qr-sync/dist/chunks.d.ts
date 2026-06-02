export interface QRChunk {
    /** Transfer id — groups the chunks of one payload together. */
    id: string;
    /** Total number of chunks in this transfer. */
    total: number;
    /** 0-based position of this chunk. */
    index: number;
    /** Slice of the base64-of-deflated-JSON payload. */
    data: string;
}
/**
 * Serialize `data` (any JSON-serializable value) → deflate → base64 → split into
 * QR-sized chunks. Returns an array of JSON strings, each one a {@link QRChunk}
 * ready to render as a QR code.
 */
export declare function encodeToChunks<T>(data: T, chunkSize?: number): string[];
/**
 * Reverse of {@link encodeToChunks}: take the scanned chunk packets (in any order),
 * reassemble, inflate, and parse back into `T`.
 */
export declare function assembleFromChunks<T>(packets: string[]): T;
//# sourceMappingURL=chunks.d.ts.map