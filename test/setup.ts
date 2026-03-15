import { vi } from 'vitest'

// Mock crypto.getRandomValues for consistent testing
const mockGetRandomValues = vi.fn((array: Uint8Array) => {
  // Fill with predictable values for testing
  for (let i = 0; i < array.length; i++) {
    array[i] = i % 256
  }
  return array
})

// Mock Web Crypto API for testing environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues,
    subtle: {
      importKey: vi.fn(),
      deriveKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      exportKey: vi.fn(),
      sign: vi.fn(),
      verify: vi.fn(),
      digest: vi.fn(),
      wrapKey: vi.fn(),
      unwrapKey: vi.fn()
    }
  },
  writable: true
})

// Mock window.location for HTTPS checks
Object.defineProperty(global, 'window', {
  value: {
    location: {
      protocol: 'https:',
      hostname: 'localhost'
    }
  },
  writable: true
})

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock btoa/atob
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary')