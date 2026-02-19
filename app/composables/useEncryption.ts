import { useSupabaseClient, useSupabaseUser } from '#imports'
import { deriveEncryptionKey, encryptString, decryptString } from '../utils/crypto'

/**
 * Client-side encryption service using AES-256-GCM + PBKDF2 key derivation.
 *
 * Key derivation: PBKDF2(user.id, profiles.encryption_key_salt, 100_000, SHA-256)
 *
 * ⚠️ SECURITY NOTE (thesis): A DB admin with access to user.id + salt could
 * reconstruct the key. In production, use a user passphrase or per-device
 * CryptoKey. Accepted trade-off for this student project.
 */
export const useEncryption = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Cached CryptoKey — lives in memory only, cleared on logout
  const cryptoKey = useState<CryptoKey | null>('encryptionKey', () => null)
  const isReady = computed(() => cryptoKey.value !== null)

  /**
   * Derive AES-256-GCM key from user.id + salt via PBKDF2.
   * Called once after login; cached for the session.
   */
  async function deriveKey(): Promise<void> {
    if (cryptoKey.value) return

    const userId = user.value?.id
    if (!userId) throw new Error('Cannot derive encryption key: no authenticated user')

    const { data, error } = await supabase
      .from('profiles')
      .select('encryption_key_salt')
      .eq('id', userId)
      .single()

    if (error || !data?.encryption_key_salt) {
      throw new Error('Cannot derive encryption key: salt not found')
    }

    cryptoKey.value = await deriveEncryptionKey(userId, data.encryption_key_salt as string)
  }

  /**
   * Encrypt plaintext → base64 ciphertext.
   */
  async function encrypt(plaintext: string): Promise<string> {
    if (!cryptoKey.value) throw new Error('Encryption key not ready — call deriveKey() first')
    return encryptString(plaintext, cryptoKey.value)
  }

  /**
   * Decrypt base64 ciphertext → plaintext.
   */
  async function decrypt(ciphertextB64: string): Promise<string> {
    if (!cryptoKey.value) throw new Error('Encryption key not ready — call deriveKey() first')
    try {
      return await decryptString(ciphertextB64, cryptoKey.value)
    } catch {
      throw new Error('Decryption failed — data may be corrupted or key mismatch')
    }
  }

  /**
   * Clear the cached key from memory. Call on logout.
   */
  function clearKey(): void {
    cryptoKey.value = null
  }

  return {
    isReady,
    deriveKey,
    encrypt,
    decrypt,
    clearKey,
  }
}
