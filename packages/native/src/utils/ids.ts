/**
 * Generate a pseudo-unique ID combining timestamp + random suffix.
 * Format: base36(timestamp) + base36(random)
 * Good enough for local data without external dependencies.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `${timestamp}${random}`;
}

/**
 * Generate multiple IDs at once (useful for batch creation).
 */
export function generateIds(count: number): string[] {
  return Array.from({ length: count }, () => generateId());
}
