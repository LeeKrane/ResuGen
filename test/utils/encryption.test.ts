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
})