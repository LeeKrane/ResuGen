import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EncryptionServiceImpl, EncryptionError, encryptionService } from '~/utils/encryption'

const originalWindow = global.window

describe('EncryptionService', () => {
  let service: EncryptionServiceImpl
  
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {
        location: {
          protocol: 'https:',
          hostname: 'localhost'
        }
      },
      writable: true,
      configurable: true
    })
    
    service = new EncryptionServiceImpl()
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    service.clearKeys()
    if (originalWindow) {
      global.window = originalWindow
    }
  })

  describe('Browser Compatibility Checks', () => {
    it('should throw error when not in HTTPS context', () => {
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            protocol: 'http:',
            hostname: 'example.com'
          }
        },
        writable: true,
        configurable: true
      })
      
      expect(() => new EncryptionServiceImpl()).toThrow(EncryptionError)
      expect(() => new EncryptionServiceImpl()).toThrow('Encryption requires HTTPS')
    })

    it('should allow localhost over HTTP', () => {
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            protocol: 'http:',
            hostname: 'localhost'
          }
        },
        writable: true,
        configurable: true
      })
      
      expect(() => new EncryptionServiceImpl()).not.toThrow()
    })

    it('should throw error when Web Crypto API is not available', () => {
      const originalCrypto = global.crypto
      // @ts-ignore
      global.crypto = undefined
      
      expect(() => new EncryptionServiceImpl()).toThrow(EncryptionError)
      expect(() => new EncryptionServiceImpl()).toThrow('Web Crypto API is not supported')
      
      global.crypto = originalCrypto
    })

    it('should throw error when crypto.subtle is not available', () => {
      const originalCrypto = global.crypto
      global.crypto = { ...originalCrypto, subtle: undefined as any }
      
      expect(() => new EncryptionServiceImpl()).toThrow(EncryptionError)
      expect(() => new EncryptionServiceImpl()).toThrow('Web Crypto API is not supported')
      
      global.crypto = originalCrypto
    })

    it('should throw error when required crypto methods are missing', () => {
      const originalCrypto = global.crypto
      global.crypto = {
        ...originalCrypto,
        subtle: {
          ...originalCrypto.subtle,
          importKey: undefined as any
        }
      }
      
      expect(() => new EncryptionServiceImpl()).toThrow(EncryptionError)
      expect(() => new EncryptionServiceImpl()).toThrow('Required crypto method importKey is not available')
      
      global.crypto = originalCrypto
    })
  })

  describe('Key Management', () => {
    it('should initialize correctly from password and salt', async () => {
      const mockKey = { type: 'secret' } as CryptoKey
      
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue(mockKey)
      
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      expect(service.isInitialized()).toBe(true)
      expect(crypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        'PBKDF2',
        false,
        ['deriveKey']
      )
      expect(crypto.subtle.deriveKey).toHaveBeenCalledWith(
        {
          name: 'PBKDF2',
          salt: expect.any(Uint8Array),
          iterations: 100000,
          hash: 'SHA-256'
        },
        expect.any(Object),
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      )
    })

    it('should handle key derivation failures', async () => {
      vi.mocked(crypto.subtle.importKey).mockRejectedValue(new Error('Key import failed'))
      
      await expect(service.initializeFromPassword('testpassword', 'testsalt'))
        .rejects.toThrow(EncryptionError)
      
      expect(service.isInitialized()).toBe(false)
    })

    it('should clear keys properly', async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      
      await service.initializeFromPassword('testpassword', 'testsalt')
      expect(service.isInitialized()).toBe(true)
      
      service.clearKeys()
      expect(service.isInitialized()).toBe(false)
    })

    it('should use correct PBKDF2 parameters', async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      const deriveKeyCall = vi.mocked(crypto.subtle.deriveKey).mock.calls[0]
      const pbkdf2Params = deriveKeyCall[0] as any
      
      expect(pbkdf2Params.iterations).toBe(100000)
      expect(pbkdf2Params.hash).toBe('SHA-256')
      expect(pbkdf2Params.name).toBe('PBKDF2')
    })
  })

  describe('Encryption/Decryption Operations', () => {
    beforeEach(async () => {
      // Mock successful key initialization
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      await service.initializeFromPassword('testpassword', 'testsalt')
    })

    it('should encrypt data successfully', async () => {
      const testData = 'Hello, World!'
      const mockEncryptedBuffer = new ArrayBuffer(16)
      
      vi.mocked(crypto.subtle.encrypt).mockResolvedValue(mockEncryptedBuffer)
      
      const result = await service.encrypt(testData)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(crypto.subtle.encrypt).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          iv: expect.any(Uint8Array)
        },
        expect.any(Object),
        expect.any(Uint8Array)
      )
    })

    it('should decrypt data successfully', async () => {
      const testData = 'Hello, World!'
      const mockDecryptedBuffer = new TextEncoder().encode(testData).buffer
      
      vi.mocked(crypto.subtle.decrypt).mockResolvedValue(mockDecryptedBuffer)
      
      // Create a mock encrypted string (base64 encoded IV + encrypted data)
      const mockIV = new Uint8Array(12)
      const mockEncrypted = new Uint8Array(16)
      const combined = new Uint8Array(28)
      combined.set(mockIV)
      combined.set(mockEncrypted, 12)
      const encryptedString = btoa(String.fromCharCode(...combined))
      
      const result = await service.decrypt(encryptedString)
      
      expect(result).toBe(testData)
      expect(crypto.subtle.decrypt).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          iv: expect.any(Uint8Array)
        },
        expect.any(Object),
        expect.any(Uint8Array)
      )
    })

    it('should handle encryption failures', async () => {
      vi.mocked(crypto.subtle.encrypt).mockRejectedValue(new Error('Encryption failed'))
      
      await expect(service.encrypt('test data'))
        .rejects.toThrow(EncryptionError)
    })

    it('should handle decryption failures', async () => {
      vi.mocked(crypto.subtle.decrypt).mockRejectedValue(new Error('Decryption failed'))
      
      const mockEncryptedString = btoa('invalid encrypted data')
      
      await expect(service.decrypt(mockEncryptedString))
        .rejects.toThrow(EncryptionError)
    })

    it('should throw error when encrypting without initialization', async () => {
      service.clearKeys()
      
      await expect(service.encrypt('test data'))
        .rejects.toThrow(EncryptionError)
      await expect(service.encrypt('test data'))
        .rejects.toThrow('Encryption service not initialized')
    })

    it('should throw error when decrypting without initialization', async () => {
      service.clearKeys()
      
      await expect(service.decrypt('encrypted data'))
        .rejects.toThrow(EncryptionError)
      await expect(service.decrypt('encrypted data'))
        .rejects.toThrow('Encryption service not initialized')
    })

    it('should use random IV for each encryption', async () => {
      const mockEncryptedBuffer = new ArrayBuffer(16)
      vi.mocked(crypto.subtle.encrypt).mockResolvedValue(mockEncryptedBuffer)
      
      await service.encrypt('test data 1')
      await service.encrypt('test data 2')
      
      // Verify that crypto.getRandomValues was called for each encryption
      expect(crypto.getRandomValues).toHaveBeenCalledTimes(2)
    })
  })

  describe('Object Encryption/Decryption', () => {
    beforeEach(async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      // Mock encrypt/decrypt to return predictable results
      vi.mocked(crypto.subtle.encrypt).mockImplementation(async (algorithm, key, data) => {
        const input = new TextDecoder().decode(data as ArrayBuffer)
        return new TextEncoder().encode(`encrypted_${input}`).buffer
      })
      
      vi.mocked(crypto.subtle.decrypt).mockImplementation(async (algorithm, key, data) => {
        const input = new TextDecoder().decode(data as ArrayBuffer)
        const original = input.replace('encrypted_', '')
        return new TextEncoder().encode(original).buffer
      })
    })

    it('should encrypt object properties', async () => {
      const testObj = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      }
      
      const result = await service.encryptObject(testObj)
      
      expect(result).toHaveProperty('name_encrypted')
      expect(result).toHaveProperty('email_encrypted')
      expect(result).toHaveProperty('age_encrypted')
      expect(Object.keys(result)).toHaveLength(3)
    })

    it('should decrypt object properties', async () => {
      const encryptedObj = {
        name_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_John Doe')))),
        email_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_john@example.com')))),
        age_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_30'))))
      }
      
      const result = await service.decryptObject(encryptedObj)
      
      expect(result).toHaveProperty('name', 'John Doe')
      expect(result).toHaveProperty('email', 'john@example.com')
      expect(result).toHaveProperty('age', 30)
    })

    it('should handle null and undefined values in objects', async () => {
      const testObj = {
        name: 'John Doe',
        middleName: null,
        nickname: undefined,
        email: 'john@example.com'
      }
      
      const result = await service.encryptObject(testObj)
      
      expect(result).toHaveProperty('name_encrypted')
      expect(result).toHaveProperty('email_encrypted')
      expect(result).not.toHaveProperty('middleName_encrypted')
      expect(result).not.toHaveProperty('nickname_encrypted')
    })

    it('should handle non-string values by JSON stringifying', async () => {
      const testObj = {
        name: 'John Doe',
        hobbies: ['reading', 'coding'],
        settings: { theme: 'dark', notifications: true }
      }
      
      const encrypted = await service.encryptObject(testObj)
      const decrypted = await service.decryptObject(encrypted)
      
      expect(decrypted.hobbies).toEqual(['reading', 'coding'])
      expect(decrypted.settings).toEqual({ theme: 'dark', notifications: true })
    })
  })

  describe('Resume Data Encryption/Decryption', () => {
    beforeEach(async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      vi.mocked(crypto.subtle.encrypt).mockImplementation(async (algorithm, key, data) => {
        const input = new TextDecoder().decode(data as ArrayBuffer)
        return new TextEncoder().encode(`encrypted_${input}`).buffer
      })
      
      vi.mocked(crypto.subtle.decrypt).mockImplementation(async (algorithm, key, data) => {
        const input = new TextDecoder().decode(data as ArrayBuffer)
        const original = input.replace('encrypted_', '')
        return new TextEncoder().encode(original).buffer
      })
    })

    it('should encrypt resume data with correct field mapping', async () => {
      const resumeData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        summary: 'Software Developer',
        birth_year: 1990,
        birth_month: 5,
        birth_day: 15,
        avatar_data: 'base64imagedata',
        avatar_filename: 'avatar.jpg',
        avatar_content_type: 'image/jpeg',
        hobbies: ['reading', 'coding'],
        style_id: 'modern'
      }
      
      const result = await service.encryptResumeData(resumeData)
      
      expect(result).toHaveProperty('name_encrypted')
      expect(result).toHaveProperty('email_encrypted')
      expect(result).toHaveProperty('phone_encrypted')
      expect(result).toHaveProperty('address_encrypted')
      expect(result).toHaveProperty('summary_encrypted')
      expect(result).toHaveProperty('birth_year_encrypted')
      expect(result).toHaveProperty('birth_month_encrypted')
      expect(result).toHaveProperty('birth_day_encrypted')
      expect(result).toHaveProperty('avatar_data_encrypted')
      expect(result).toHaveProperty('avatar_filename_encrypted')
      expect(result).toHaveProperty('avatar_content_type_encrypted')
      expect(result).toHaveProperty('hobbies_encrypted')
      
      expect(result).not.toHaveProperty('style_id_encrypted')
    })

    it('should decrypt resume data with correct type conversion', async () => {
      const encryptedData = {
        name_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_John Doe')))),
        birth_year_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_1990')))),
        birth_month_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_5')))),
        birth_day_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_15')))),
        hobbies_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_["reading","coding"]'))))
      }
      
      const result = await service.decryptResumeData(encryptedData)
      
      expect(result.name).toBe('John Doe')
      expect(result.birth_year).toBe(1990)
      expect(result.birth_month).toBe(5)
      expect(result.birth_day).toBe(15)
      expect(result.hobbies).toEqual(['reading', 'coding'])
    })

    it('should handle missing or null resume fields', async () => {
      const resumeData = {
        name: 'John Doe',
        email: null,
        phone: undefined,
        summary: 'Developer'
      }
      
      const result = await service.encryptResumeData(resumeData)
      
      expect(result).toHaveProperty('name_encrypted')
      expect(result).toHaveProperty('summary_encrypted')
      expect(result).not.toHaveProperty('email_encrypted')
      expect(result).not.toHaveProperty('phone_encrypted')
    })

    it('should handle invalid JSON in hobbies field during decryption', async () => {
      const encryptedData = {
        hobbies_encrypted: btoa(String.fromCharCode(...Array.from(new Uint8Array(12)), ...Array.from(new TextEncoder().encode('encrypted_invalid json'))))
      }
      
      const result = await service.decryptResumeData(encryptedData)
      
      expect(result.hobbies).toEqual([])
    })
  })

  describe('Performance Benchmarks', () => {
    beforeEach(async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      vi.mocked(crypto.subtle.encrypt).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1))
        return new ArrayBuffer(32)
      })
      
      vi.mocked(crypto.subtle.decrypt).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1))
        return new TextEncoder().encode('decrypted data').buffer
      })
    })

    it('should encrypt small data within performance threshold', async () => {
      const testData = 'Small test string'
      const startTime = performance.now()
      
      await service.encrypt(testData)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within 100ms for small data
      expect(duration).toBeLessThan(100)
    })

    it('should encrypt large resume data within performance threshold', async () => {
      const largeResumeData = {
        name: 'John Doe',
        summary: 'A'.repeat(1000), // Large summary
        hobbies: Array(100).fill('hobby'),
        experience: Array(50).fill({
          title: 'Software Developer',
          company: 'Tech Company',
          description: 'B'.repeat(500)
        })
      }
      
      const startTime = performance.now()
      
      await service.encryptResumeData(largeResumeData)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within 500ms for large data
      expect(duration).toBeLessThan(500)
    })

    it('should handle key derivation within reasonable time', async () => {
      const newService = new EncryptionServiceImpl()
      
      const startTime = performance.now()
      
      await newService.initializeFromPassword('testpassword', 'testsalt')
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000)
    })

    it('should handle multiple concurrent operations', async () => {
      const operations = Array(10).fill(0).map((_, i) => 
        service.encrypt(`Test data ${i}`)
      )
      
      const startTime = performance.now()
      
      await Promise.all(operations)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(200)
    })
  })

  describe('Error Handling', () => {
    it('should create EncryptionError with correct properties', () => {
      const error = new EncryptionError('Test error message', 'TEST_CODE')
      
      expect(error.name).toBe('EncryptionError')
      expect(error.message).toBe('Test error message')
      expect(error.code).toBe('TEST_CODE')
      expect(error instanceof Error).toBe(true)
    })

    it('should handle base64 encoding/decoding errors', async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      const originalAtob = global.atob
      global.atob = vi.fn().mockImplementation((str: string) => {
        if (str.includes('!@#')) {
          throw new Error('Invalid base64')
        }
        return originalAtob(str)
      })
      
      await expect(service.decrypt('invalid base64!@#'))
        .rejects.toThrow(EncryptionError)
      
      global.atob = originalAtob
    })

    it('should handle corrupted encrypted data', async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      await service.initializeFromPassword('testpassword', 'testsalt')
      
      vi.mocked(crypto.subtle.decrypt).mockRejectedValue(new Error('Invalid data'))
      
      const corruptedData = btoa('corrupted encrypted data')
      
      await expect(service.decrypt(corruptedData))
        .rejects.toThrow(EncryptionError)
    })
  })

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(encryptionService).toBeDefined()
      expect(encryptionService).toBeInstanceOf(EncryptionServiceImpl)
    })

    it('should maintain state across imports', async () => {
      vi.mocked(crypto.subtle.importKey).mockResolvedValue({} as CryptoKey)
      vi.mocked(crypto.subtle.deriveKey).mockResolvedValue({} as CryptoKey)
      
      await encryptionService.initializeFromPassword('testpassword', 'testsalt')
      expect(encryptionService.isInitialized()).toBe(true)
      
      encryptionService.clearKeys()
      expect(encryptionService.isInitialized()).toBe(false)
    })
  })
})
