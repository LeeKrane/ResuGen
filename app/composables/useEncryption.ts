import { useSupabaseClient, useSupabaseUser } from '#imports'
import { deriveEncryptionKey, encryptString, decryptString } from '../utils/crypto'

/**
 * Client-side encryption service using AES-256-GCM + PBKDF2 key derivation.
 *
 * Key derivation: PBKDF2(user.id, profiles.encryption_key_salt, 100_000, SHA-256)
 *
 * Security note: key derivation uses user.id + salt stored in the DB, meaning
 * a DB admin with access to both could reconstruct the key.
 */
export const useEncryption = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Cached CryptoKey - lives in memory only, cleared on logout
  const cryptoKey = useState<CryptoKey | null>('encryptionKey', () => null)
  const isReady = computed(() => cryptoKey.value !== null)

  /**
   * Derive AES-256-GCM key from user.id + salt via PBKDF2.
   * Called once after login; cached for the session.
   * If no salt exists yet (e.g. first OAuth login), generates and saves one automatically.
   * Times out after 10s to prevent infinite loading if Supabase is unreachable.
   */
  async function deriveKey(): Promise<void> {
    if (cryptoKey.value) return

    const userId = user.value?.id
    if (!userId) throw new Error('Cannot derive encryption key: no authenticated user')

    // Wrap the Supabase query in a 10s timeout so a hanging network call fails fast
    const profileQuery = supabase
      .from('profiles')
      .select('encryption_key_salt')
      .eq('id', userId)
      .maybeSingle()

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Encryption key derivation timed out - check Supabase connection')), 10_000)
    )

    const { data, error } = await Promise.race([profileQuery, timeout]) as Awaited<typeof profileQuery>

    if (error) throw new Error('Cannot derive encryption key: ' + error.message)

    let salt = data?.encryption_key_salt as string | null

    // First-time OAuth users won't have a salt - generate and persist one
    if (!salt) {
      const saltBytes = crypto.getRandomValues(new Uint8Array(32))
      salt = btoa(String.fromCharCode(...saltBytes))

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ encryption_key_salt: salt })
        .eq('id', userId)

      if (updateErr) throw new Error('Cannot save encryption salt: ' + updateErr.message)
    }

    cryptoKey.value = await deriveEncryptionKey(userId, salt)
  }

  /**
   * Encrypt plaintext → base64 ciphertext.
   */
  async function encrypt(plaintext: string): Promise<string> {
    if (!cryptoKey.value) throw new Error('Encryption key not ready - call deriveKey() first')
    return encryptString(plaintext, cryptoKey.value)
  }

  /**
   * Decrypt base64 ciphertext → plaintext.
   */
  async function decrypt(ciphertextB64: string): Promise<string> {
    if (!cryptoKey.value) throw new Error('Encryption key not ready - call deriveKey() first')
    try {
      return await decryptString(ciphertextB64, cryptoKey.value)
    } catch {
      throw new Error('Decryption failed - data may be corrupted or key mismatch')
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
