"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeToChunks = encodeToChunks;
exports.assembleFromChunks = assembleFromChunks;
const pako_1 = require("pako");
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
/** base64 encode — React Native has no global btoa. */
function base64Encode(data) {
    let result = '';
    let i = 0;
    while (i < data.length) {
        const b1 = data[i++];
        const b2 = i < data.length ? data[i++] : 0;
        const b3 = i < data.length ? data[i++] : 0;
        const bitmap = (b1 << 16) | (b2 << 8) | b3;
        result += B64_CHARS.charAt((bitmap >> 18) & 63);
        result += B64_CHARS.charAt((bitmap >> 12) & 63);
        result += i - 2 < data.length ? B64_CHARS.charAt((bitmap >> 6) & 63) : '=';
        result += i - 1 < data.length ? B64_CHARS.charAt(bitmap & 63) : '=';
    }
    return result;
}
/** base64 decode — React Native has no global atob. */
function base64Decode(str) {
    const result = [];
    let i = 0;
    while (i < str.length) {
        const b1 = B64_CHARS.indexOf(str[i++]);
        const b2 = B64_CHARS.indexOf(str[i++]);
        const b3 = B64_CHARS.indexOf(str[i++]);
        const b4 = B64_CHARS.indexOf(str[i++]);
        const bitmap = (b1 << 18) | (b2 << 12) | ((b3 & 63) << 6) | (b4 & 63);
        result.push((bitmap >> 16) & 255);
        if (b3 !== 64)
            result.push((bitmap >> 8) & 255);
        if (b4 !== 64)
            result.push(bitmap & 255);
    }
    return new Uint8Array(result);
}
const DEFAULT_CHUNK_SIZE = 800;
/**
 * Serialize `data` (any JSON-serializable value) → deflate → base64 → split into
 * QR-sized chunks. Returns an array of JSON strings, each one a {@link QRChunk}
 * ready to render as a QR code.
 */
function encodeToChunks(data, chunkSize = DEFAULT_CHUNK_SIZE) {
    const b64 = base64Encode((0, pako_1.deflate)(JSON.stringify(data)));
    const id = Date.now().toString(36);
    const total = Math.max(1, Math.ceil(b64.length / chunkSize));
    const chunks = [];
    for (let index = 0; index < total; index++) {
        const start = index * chunkSize;
        const chunk = {
            id,
            total,
            index,
            data: b64.substring(start, start + chunkSize),
        };
        chunks.push(JSON.stringify(chunk));
    }
    return chunks;
}
/**
 * Reverse of {@link encodeToChunks}: take the scanned chunk packets (in any order),
 * reassemble, inflate, and parse back into `T`.
 */
function assembleFromChunks(packets) {
    const chunks = packets.map((p) => JSON.parse(p));
    chunks.sort((a, b) => a.index - b.index);
    const b64 = chunks.map((c) => c.data).join('');
    const json = (0, pako_1.inflate)(base64Decode(b64), { to: 'string' });
    return JSON.parse(json);
}
//# sourceMappingURL=chunks.js.map