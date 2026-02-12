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
})
