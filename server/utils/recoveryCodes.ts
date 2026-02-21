import { customAlphabet } from 'nanoid'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // avoid I, O, 0, 1
const gen = customAlphabet(ALPHABET, 12)

export function generateRecoveryCodes(count = 10) {
    return Array.from({ length: count }, () => {
        const raw = gen() // 12 chars
        return raw.match(/.{1,4}/g)!.join('-') // XXXX-XXXX-XXXX
    })
}

export function normalizeRecoveryCode(code: string) {
    return code.replace(/[-\s]/g, '').toUpperCase()
}