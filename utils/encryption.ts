/**
 * Client-side encryption service for ResuGen
 * Provides AES-GCM encryption with PBKDF2 key derivation
 * All sensitive data is encrypted before transmission to the server
 */

export interface EncryptionService {
  initializeFromPassword(password: string, salt: string): Promise<void>
  clearKeys(): void
  isInitialized(): boolean
  
  encrypt(data: string): Promise<string>
  decrypt(encryptedData: string): Promise<string>
  encryptObject<T>(obj: T): Promise<Record<string, string>>
  decryptObject<T>(encryptedObj: Record<string, string>): Promise<T>
  
  encryptResumeData(data: any): Promise<Record<string, string>>
  decryptResumeData(encrypted: Record<string, string>): Promise<any>
}

export interface EncryptedData {
  data: string
  iv: string
}

export class EncryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}

class EncryptionServiceImpl implements EncryptionService {
  private encryptionKey: CryptoKey | null = null
  private readonly PBKDF2_ITERATIONS = 100000
  private readonly KEY_LENGTH = 256 // AES-256
  private readonly IV_LENGTH = 12 // 96 bits for GCM
  
  constructor() {
    this.checkBrowserCompatibility()
  }
  
  /**
   * Check if the browser supports required Web Crypto API features
   * Throws an error if not supported or not running in secure context
   */
  private checkBrowserCompatibility(): void {
    // Check for HTTPS requirement
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      throw new EncryptionError(
        'Encryption requires HTTPS. Please access the application over a secure connection.',
        'HTTPS_REQUIRED'
      )
    }
    
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new EncryptionError(
        'Web Crypto API is not supported in this browser. Please use a modern browser.',
        'CRYPTO_NOT_SUPPORTED'
      )
    }
    
    const requiredSubtleMethods = ['importKey', 'deriveKey', 'encrypt', 'decrypt']
    for (const method of requiredSubtleMethods) {
      if (typeof crypto.subtle[method as keyof SubtleCrypto] !== 'function') {
        throw new EncryptionError(
          `Required crypto method ${method} is not available.`,
          'CRYPTO_METHOD_MISSING'
        )
      }
    }
    
    if (typeof crypto.getRandomValues !== 'function') {
      throw new EncryptionError(
        'Required crypto method getRandomValues is not available.',
        'CRYPTO_METHOD_MISSING'
      )
    }
  }
  
  /**
   * Initialize encryption key from user password and salt
   * Uses PBKDF2 with 100,000 iterations for key derivation
   */
  async initializeFromPassword(password: string, salt: string): Promise<void> {
    try {
      // Convert password to key material
      const passwordBuffer = new TextEncoder().encode(password)
      const saltBuffer = new TextEncoder().encode(salt)
      
      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
      )
      
      // Derive encryption key using PBKDF2
      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: this.PBKDF2_ITERATIONS,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: this.KEY_LENGTH
        },
        false, // Key is not extractable
        ['encrypt', 'decrypt']
      )
      
      passwordBuffer.fill(0)
      
    } catch (error) {
      this.encryptionKey = null
      throw new EncryptionError(
        `Failed to initialize encryption key: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'KEY_DERIVATION_FAILED'
      )
    }
  }
}

// Export singleton instance
export const encryptionService: EncryptionService = new EncryptionServiceImpl()

// Export for testing
export { EncryptionServiceImpl }