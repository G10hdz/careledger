import { b64UrlToBytes, bytesToB64Url } from './codec'

export interface DeviceKeys {
  publicJwk: JsonWebKey
  /** No extraíble: el navegador la guarda en IndexedDB sin dejar leer el material. */
  privateKey: CryptoKey
}

export async function createDeviceKeys(): Promise<DeviceKeys> {
  const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify'])
  // La pública siempre es exportable, aunque el par se pida no extraíble.
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  return { publicJwk, privateKey: pair.privateKey }
}

/** Migra una llave JWK guardada por versiones anteriores a una no extraíble. */
export async function importPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['sign'])
}

async function importPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['verify'])
}

export async function signText(privateKey: CryptoKey | JsonWebKey, text: string): Promise<string> {
  const key = 'type' in privateKey ? privateKey : await importPrivate(privateKey)
  const signature = await crypto.subtle.sign({ name: 'Ed25519' }, key, new TextEncoder().encode(text))
  return bytesToB64Url(signature)
}

export async function verifyText(publicJwk: JsonWebKey, text: string, signature: string): Promise<boolean> {
  const key = await importPublic(publicJwk)
  return crypto.subtle.verify({ name: 'Ed25519' }, key, b64UrlToBytes(signature), new TextEncoder().encode(text))
}
