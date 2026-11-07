import { describe, expect, it } from 'vitest'
import { hex, hmacSha256, sha256, utf8 } from './sha256'

describe('sha256 (FIPS 180-4 vectores de prueba)', () => {
  it('hash del string vacío', () => {
    expect(hex(sha256(new Uint8Array(0)))).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })

  it('hash de "abc"', () => {
    expect(hex(sha256(utf8('abc')))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('hash de 64+ bytes (dos bloques, padding con longitud)', () => {
    expect(
      hex(sha256(utf8('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))),
    ).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1')
  })
})

describe('hmacSha256 (RFC 4231 caso 1)', () => {
  it('key 0x0b×20 y "Hi There"', () => {
    const key = new Uint8Array(20).fill(0x0b)
    expect(hex(hmacSha256(key, utf8('Hi There')))).toBe(
      'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7',
    )
  })

  it('clave más larga que el bloque se comprime primero', () => {
    const key = utf8('una-clave-de-ledger-municipal-bastante-larga-para-exceder-64-bytes')
    const mac = hmacSha256(key, utf8('CV-2026-0087-MX|despensa-basica'))
    expect(hex(mac)).toHaveLength(64)
    // Determinístico y distinto del hash directo.
    expect(hex(mac)).toBe(hex(hmacSha256(key, utf8('CV-2026-0087-MX|despensa-basica'))))
    expect(hex(mac)).not.toBe(hex(sha256(utf8('CV-2026-0087-MX|despensa-basica'))))
  })
})
