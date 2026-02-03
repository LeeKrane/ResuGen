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
  
  clearKeys(): void {
    this.encryptionKey = null
  }
  
  isInitialized(): boolean {
    return this.encryptionKey !== null
  }
  
  /**
   * Encrypt a string using AES-GCM
   * Returns base64-encoded encrypted data with IV
   */
  async encrypt(data: string): Promise<string> {
    if (!this.isInitialized()) {
      throw new EncryptionError('Encryption service not initialized', 'NOT_INITIALIZED')
    }
    
    try {
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))
      
      const dataBuffer = new TextEncoder().encode(data)
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey!,
        dataBuffer
      )
      
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encryptedBuffer), iv.length)
      
      return this.arrayBufferToBase64(combined)
      
    } catch (error) {
      throw new EncryptionError(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ENCRYPTION_FAILED'
      )
    }
  }
  
  /**
   * Decrypt a base64-encoded encrypted string
   * Extracts IV and decrypts using AES-GCM
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.isInitialized()) {
      throw new EncryptionError('Encryption service not initialized', 'NOT_INITIALIZED')
    }
    
    try {
      const combined = this.base64ToArrayBuffer(encryptedData)
      
      const iv = combined.slice(0, this.IV_LENGTH)
      const encrypted = combined.slice(this.IV_LENGTH)
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey!,
        encrypted
      )
      
      return new TextDecoder().decode(decryptedBuffer)
      
    } catch (error) {
      throw new EncryptionError(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DECRYPTION_FAILED'
      )
    }
  }
  
  async encryptObject<T>(obj: T): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (typeof value === 'string') {
        result[`${key}_encrypted`] = await this.encrypt(value)
      } else if (value !== null && value !== undefined) {
        // Convert non-string values to JSON strings before encryption
        result[`${key}_encrypted`] = await this.encrypt(JSON.stringify(value))
      }
    }
    
    return result
  }
  
  async decryptObject<T>(encryptedObj: Record<string, string>): Promise<T> {
    const result: Record<string, any> = {}
    
    for (const [key, encryptedValue] of Object.entries(encryptedObj)) {
      if (key.endsWith('_encrypted')) {
        const originalKey = key.replace('_encrypted', '')
        const decryptedValue = await this.decrypt(encryptedValue)
        
        // Try to parse as JSON, fallback to string
        try {
          result[originalKey] = JSON.parse(decryptedValue)
        } catch {
          result[originalKey] = decryptedValue
        }
      }
    }
    
    return result as T
  }
  
  async encryptResumeData(data: any): Promise<Record<string, string>> {
    const encryptedData: Record<string, string> = {}
    
    const fieldsToEncrypt = [
      'name', 'subtitle', 'email', 'phone', 'address', 'summary',
      'birth_year', 'birth_month', 'birth_day',
      'avatar_data', 'avatar_filename', 'avatar_content_type',
      'hobbies'
    ]
    
    for (const field of fieldsToEncrypt) {
      if (data[field] !== undefined && data[field] !== null) {
        const valueToEncrypt = typeof data[field] === 'string' 
          ? data[field] 
          : JSON.stringify(data[field])
        encryptedData[`${field}_encrypted`] = await this.encrypt(valueToEncrypt)
      }
    }
    
    return encryptedData
  }
  
  async decryptResumeData(encrypted: Record<string, string>): Promise<any> {
    const decryptedData: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(encrypted)) {
      if (key.endsWith('_encrypted')) {
        const originalKey = key.replace('_encrypted', '')
        const decryptedValue = await this.decrypt(value)
        
        // Handle specific field types
        if (['birth_year', 'birth_month', 'birth_day'].includes(originalKey)) {
          decryptedData[originalKey] = parseInt(decryptedValue, 10)
        } else if (originalKey === 'hobbies') {
          try {
            decryptedData[originalKey] = JSON.parse(decryptedValue)
          } catch {
            decryptedData[originalKey] = []
          }
        } else {
          decryptedData[originalKey] = decryptedValue
        }
      }
    }
    
    return decryptedData
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
  
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}

// Export singleton instance
export const encryptionService: EncryptionService = new EncryptionServiceImpl()

// Export for testing
export { EncryptionServiceImpl }