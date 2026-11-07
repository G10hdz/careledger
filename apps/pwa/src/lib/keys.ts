import { b64UrlToBytes, bytesToB64Url } from './codec'

export interface DeviceKeys {
  publicJwk: JsonWebKey
  privateJwk: JsonWebKey
}

export async function createDeviceKeys(): Promise<DeviceKeys> {
  const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  return { publicJwk, privateJwk }
}

async function importPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['sign'])
}

async function importPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['verify'])
}

export async function signText(privateJwk: JsonWebKey, text: string): Promise<string> {
  const key = await importPrivate(privateJwk)
  const signature = await crypto.subtle.sign({ name: 'Ed25519' }, key, new TextEncoder().encode(text))
  return bytesToB64Url(signature)
}

export async function verifyText(publicJwk: JsonWebKey, text: string, signature: string): Promise<boolean> {
  const key = await importPublic(publicJwk)
  return crypto.subtle.verify({ name: 'Ed25519' }, key, b64UrlToBytes(signature), new TextEncoder().encode(text))
}
