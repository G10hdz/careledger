import type { CareSession } from '@careledger/domain'
import { stableStringify } from './codec'

/** Lo único que viaja en la atestación. Sin nombres, diagnósticos, fotos ni GPS. */
export const CANONICAL_KEYS = [
  'category',
  'kind',
  'minutes',
  'nodeId',
  'occurredAt',
  'selfCareType',
  'sessionId',
  'supportTypes',
] as const

const CANONICAL_SET = new Set<string>(CANONICAL_KEYS)

export function canonicalFromSession(session: CareSession): string {
  const body: Record<string, unknown> = {
    kind: session.kind,
    minutes: session.minutes,
    nodeId: session.nodeId,
    occurredAt: session.occurredAt,
    sessionId: session.id,
  }
  if (session.kind === 'cuidado' && session.category) body.category = session.category
  if (session.kind === 'autocuidado' && session.selfCareType) body.selfCareType = session.selfCareType
  if (session.kind === 'cuidado') body.supportTypes = [...session.supportTypes].sort()
  return stableStringify(body)
}

export function semanticHashInput(session: CareSession): string {
  const body: Record<string, unknown> = {
    caregiverId: session.caregiverId,
    kind: session.kind,
    minutes: session.minutes,
    nodeId: session.nodeId,
    occurredAt: session.occurredAt,
  }
  if (session.category) body.category = session.category
  if (session.selfCareType) body.selfCareType = session.selfCareType
  if (session.kind === 'cuidado') body.supportTypes = [...session.supportTypes].sort()
  return stableStringify(body)
}

export function assertCanonical(json: string): void {
  const value: unknown = JSON.parse(json)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('payload')
  }
  for (const key of Object.keys(value)) {
    if (!CANONICAL_SET.has(key)) throw new Error(`campo fuera de contrato: ${key}`)
  }
}

/** Lo que un sync futuro puede subir. La llave privada no entra. */
export function publicSyncRecord(input: {
  canonical: string
  signatures: Record<string, string | undefined>
  publicKeys: Record<string, JsonWebKey | undefined>
  status: string
  folio?: string
}): Record<string, unknown> {
  assertCanonical(input.canonical)
  const body: Record<string, unknown> = {
    canonical: input.canonical,
    signatures: input.signatures,
    publicKeys: input.publicKeys,
    status: input.status,
  }
  if (input.folio) body.folio = input.folio
  return body
}
