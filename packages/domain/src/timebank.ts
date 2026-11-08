/** Banco de tiempo (EntreManos). specs/09.
 *  La hora es la divisa: 1 h de cualquier servicio vale 1 h de cualquier
 *  otro, sin multiplicadores por profesión ni por nivel (REQ-BT-001).
 *  Funciones puras: ninguna regla lee el reloj ni estado externo. */

/** Saldo mínimo permitido en horas. specs/09 REQ-BT-004. */
export const TIMEBANK_MIN_BALANCE = -5

/** Tope de horas por intercambio. specs/09, tabla de estandarización. */
export const TIMEBANK_MAX_HOURS_PER_EXCHANGE = 8

/** specs/09 REQ-BT-011. */
export type Membership = 'demandante' | 'vecino_cuidador'

/** Nivel mínimo de habilitación. specs/09 REQ-BT-009: el nivel decide quién
 *  puede ofrecer qué; no altera el valor de la hora. */
export type Level = 'N0' | 'N1' | 'N2'

export type ServiceKind = 'cuidado' | 'oficio'

export interface TimebankService {
  id: string
  kind: ServiceKind
  minLevel: Level
}

export interface Member {
  id: string
  membership: Membership
  level: Level
  /** specs/09 REQ-BT-006: no puede ofrecer servicios de intercambio. */
  publicServant: boolean
}

/** specs/09 REQ-BT-003: confirma la familia cuidada o un tercero;
 *  quien da el servicio no puede confirmarse a sí mismo. */
export interface Confirmation {
  by: 'familia' | 'tercero'
  confirmerId: string
}

export type TimebankRejection =
  | 'saldo'
  | 'nivel'
  | 'servidor_publico'
  | 'sin_cuidado'
  | 'duracion'
  | 'mismo_miembro'

const LEVEL_RANK: Record<Level, number> = { N0: 0, N1: 1, N2: 2 }

/** Mínimo por servicio. specs/09, tabla de estandarización. */
export const TIMEBANK_MIN_HOURS_PER_SERVICE = 0.5

/** Duraciones válidas: bloques de 15 min, de 30 min a 8 h. specs/09. */
function isValidDuration(hours: number): boolean {
  return (
    hours >= TIMEBANK_MIN_HOURS_PER_SERVICE &&
    hours <= TIMEBANK_MAX_HOURS_PER_EXCHANGE &&
    Number.isInteger(hours * 4)
  )
}

/** Valida un intercambio sin ejecutarlo. El proveedor da `service` y el
 *  receptor paga con horas (`applyExchange`). `counterService` no es un
 *  trueque simultáneo: es lo que el receptor aporta a la red. Así un vecino
 *  cuidador puede pagar con horas el oficio de una demandante (doc v4,
 *  opción B), y dos oficios sin cuidado de por medio no (REQ-BT-012).
 *  La paridad de REQ-BT-001 es la ausencia de multiplicadores. */
export function validateExchange(opts: {
  provider: Member
  receiver: Member
  service: TimebankService
  counterService?: TimebankService
  hours: number
  receiverBalance: number
}): { ok: true } | { ok: false; reason: TimebankRejection } {
  const { provider, receiver, service, counterService, hours, receiverBalance } = opts

  if (provider.id === receiver.id) return { ok: false, reason: 'mismo_miembro' }
  if (!isValidDuration(hours)) return { ok: false, reason: 'duracion' }
  // REQ-BT-006: nadie marcado como servidor público ofrece servicios.
  // El proveedor siempre ofrece; el receptor solo si da un contra-servicio.
  if (provider.publicServant || (counterService !== undefined && receiver.publicServant)) {
    return { ok: false, reason: 'servidor_publico' }
  }
  if (LEVEL_RANK[provider.level] < LEVEL_RANK[service.minLevel]) {
    return { ok: false, reason: 'nivel' }
  }
  if (counterService !== undefined && LEVEL_RANK[receiver.level] < LEVEL_RANK[counterService.minLevel]) {
    return { ok: false, reason: 'nivel' }
  }
  // REQ-BT-012: todo intercambio lleva cuidado en al menos uno de los dos lados.
  const hasCare =
    service.kind === 'cuidado' || (counterService !== undefined && counterService.kind === 'cuidado')
  if (!hasCare) return { ok: false, reason: 'sin_cuidado' }
  // REQ-BT-004: el saldo del receptor no puede quedar por debajo de -5 h.
  if (receiverBalance - hours < TIMEBANK_MIN_BALANCE) return { ok: false, reason: 'saldo' }
  return { ok: true }
}

/** Acredita horas con la confirmación de familia o tercero (REQ-BT-003).
 *  La autoconfirmación se rechaza; las horas solo se acreditan en bloques
 *  válidos de duración. */
export function confirmHours(opts: {
  providerId: string
  hours: number
  confirmation: Confirmation
}): { ok: true; credited: number } | { ok: false; reason: TimebankRejection } {
  const { providerId, hours, confirmation } = opts

  if (providerId === confirmation.confirmerId) return { ok: false, reason: 'mismo_miembro' }
  if (!isValidDuration(hours)) return { ok: false, reason: 'duracion' }
  return { ok: true, credited: hours }
}

/** Mueve horas del receptor al proveedor en un objeto nuevo, sin mutar la
 *  entrada. La suma total de saldos se conserva. */
export function applyExchange(
  balances: Record<string, number>,
  providerId: string,
  receiverId: string,
  hours: number,
): Record<string, number> {
  const next = { ...balances }
  next[providerId] = (next[providerId] ?? 0) + hours
  next[receiverId] = (next[receiverId] ?? 0) - hours
  return next
}
