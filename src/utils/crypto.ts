/**
 * Cryptographic utility for optional PIN authentication
 * Uses browser native Web Crypto API (SHA-256)
 */

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`lifelog_salt_${pin}_secure_salt_2026`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashPin(pin);
  return actualHash === expectedHash;
}
