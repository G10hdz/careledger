import { VEEDORES } from './config'
import { createDeviceKeys, signText } from './keys'

export interface CosignRequest {
  sessionId: string
  canonical: string
  nodeId: string
  dueAt: string
}

export interface PartySignature {
  signature: string
  publicJwk: JsonWebKey
}

export interface ExternalSignatures {
  beneficiario: PartySignature
  veedor: PartySignature & { veedorId: string }
}

/**
 * Puerta del oráculo vecinal. Hoy la implementación simulada firma sola
 * cuando llega `dueAt`. Un oráculo real reemplaza esta interfaz y no toca
 * la pantalla ni el libro local.
 */
export interface OracleGateway {
  requestCosigners(request: CosignRequest): Promise<ExternalSignatures>
}

export function assignVeedor(sessionId: string, veedores: readonly string[] = VEEDORES): string {
  let index = 0
  for (const char of sessionId) index = (index + char.charCodeAt(0)) % veedores.length
  const veedor = veedores[index]
  if (!veedor) throw new Error('sin veedores')
  return veedor
}

export function createSimulatedOracle(opts: {
  now: () => number
  sleep: (ms: number) => Promise<void>
  veedores?: readonly string[]
}): OracleGateway {
  const veedores = opts.veedores ?? VEEDORES
  return {
    async requestCosigners(request) {
      // La app sella dueAt a ~10 s. Un oráculo de personas puede ignorar ese sello.
      const wait = Math.max(0, Date.parse(request.dueAt) - opts.now())
      await opts.sleep(wait)
      const veedorId = assignVeedor(request.sessionId, veedores)
      const [beneficiarioKeys, veedorKeys] = await Promise.all([createDeviceKeys(), createDeviceKeys()])
      const [beneficiarioSig, veedorSig] = await Promise.all([
        signText(beneficiarioKeys.privateJwk, request.canonical),
        signText(veedorKeys.privateJwk, request.canonical),
      ])
      return {
        beneficiario: { signature: beneficiarioSig, publicJwk: beneficiarioKeys.publicJwk },
        veedor: { signature: veedorSig, publicJwk: veedorKeys.publicJwk, veedorId },
      }
    },
  }
}
