/**
 * Pure crypto utility functions — no Nuxt/Supabase dependencies.
 * Used by useEncryption composable and directly testable.
 *
 * ⚠️ SECURITY NOTE (thesis): Key derivation uses user.id + salt, which a DB
 * admin could reconstruct. Accepted trade-off for student project.
 */

const IV_LENGTH = 12 // 96-bit IV for AES-GCM
const PBKDF2_ITERATIONS = 100_000

/**
 * Derive an AES-256-GCM CryptoKey from userId + salt via PBKDF2.
 */
export async function deriveEncryptionKey(
  userId: string,
  salt: string
): Promise<CryptoKey> {
  const enc = new TextEncoder()

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(userId),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt plaintext → base64 string.
 * Format: base64( 12-byte IV || AES-GCM ciphertext )
 */
export async function encryptString(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  const enc = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  )

  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt base64 ciphertext → plaintext string.
 * Expects format: base64( 12-byte IV || AES-GCM ciphertext )
 */
export async function decryptString(
  ciphertextB64: string,
  key: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(plainBuffer)
}
