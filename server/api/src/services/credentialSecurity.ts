import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const PASSWORD_KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, PASSWORD_KEYLEN).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const actual = scryptSync(password, salt, PASSWORD_KEYLEN)
  const expected = Buffer.from(hash, 'hex')

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
