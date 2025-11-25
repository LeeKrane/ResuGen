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

