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
})
