import type { CareSession, SupportType } from '@careledger/domain'

export const categories = ['Medicina', 'Terapia', 'Fisioterapia', 'Enfermería', 'Transporte especializado'] as const
export type Category = typeof categories[number]

/** REQ-SER-010: la hora de una cuidadora acreditada vale igual en toda la
   plataforma, sin excepciones. La junta fijó la uniformidad; el monto es un
   default demostrable que se ajusta por ADR con la Secretaría. */
export const CAREGIVER_HOURLY_RATE_MXN = 120

/** Zonas del piloto con su nodo barrial (coherencia territorial con 02). */
export const zones = [
  { name: 'Roma-Condesa', nodeId: 'nodo-roma-condesa' },
  { name: 'Del Valle', nodeId: 'nodo-del-valle' },
] as const

export type Provider = {
  id: string
  name: string
  category: Category
  zones: string[]
  /** Tarifa del listado en MXN. Para cuidadoras acreditadas es por hora y
     siempre CAREGIVER_HOURLY_RATE_MXN; la oferta pública queda fuera. */
  price: number
  public: boolean
  availability: string
  certification: string
  accredited: boolean
  accreditationId?: string
}

export type Status = 'enviada' | 'aceptada' | 'agendada' | 'completada' | 'rechazada'

export type Request = {
  id: string
  providerId: string
  category: Category
  zone: string
  budgetMin: number
  budgetMax: number
  schedule: string
  status: Status
}

export type FutureCareSession = Pick<CareSession, 'caregiverId' | 'nodeId' | 'minutes' | 'supportTypes' | 'occurredAt'>

export const STATUS_FLOW: Status[] = ['enviada', 'aceptada', 'agendada', 'completada']

export function filterProviders(providers: Provider[], zone: string, min: number, max: number, category: string): Provider[] {
  return providers.filter(p => p.zones.includes(zone) && (!category || p.category === category)).sort((a, b) => Number(b.price >= min && b.price <= max) - Number(a.price >= min && a.price <= max))
}

/** REQ-SER-004: etiqueta pública/privada sin ambigüedad. */
export function offerLabel(provider: Provider): 'Público · gratuito' | 'Público · subsidiado' | 'Privado' {
  if (!provider.public) return 'Privado'
  return provider.price === 0 ? 'Público · gratuito' : 'Público · subsidiado'
}

const transitions: Record<Status, Status[]> = { enviada: ['aceptada', 'rechazada'], aceptada: ['agendada'], agendada: ['completada'], completada: [], rechazada: [] }

export function transition(request: Request, next: Status): Request {
  if (!transitions[request.status].includes(next)) throw new Error('Transición inválida')
  return { ...request, status: next }
}

/** REQ-SER-006: la solicitud viaja solo con tipo de necesidad, zona,
   presupuesto y horario deseado; sin datos médicos ni diagnósticos. */
export function createRequest(input: { id: string; provider: Provider; zone: string; budgetMin: number; budgetMax: number; schedule: string }): Request {
  return { id: input.id, providerId: input.provider.id, category: input.provider.category, zone: input.zone, budgetMin: input.budgetMin, budgetMax: input.budgetMax, schedule: input.schedule, status: 'enviada' }
}

const supportTypeByCategory: Record<Category, SupportType> = {
  Medicina: 'acompanamiento_medico',
  Terapia: 'estimulacion_cognitiva',
  Fisioterapia: 'otro',
  Enfermería: 'alimentacion_aseo',
  'Transporte especializado': 'acompanamiento_medico',
}

/** Jornada de demostración: 3 horas. En producción la duración la registra
   la cuidadora al completar. */
export const DEMO_SESSION_MINUTES = 180

/** REQ-SER-008: una solicitud completada de una cuidadora acreditada se
   puede registrar como jornada de cuidado en el ledger (reutiliza 02). */
export function toCareSession(request: Request, provider: Provider): FutureCareSession | null {
  if (request.status !== 'completada' || !provider.accredited) return null
  const node = zones.find(z => z.name === request.zone)
  if (!node) return null
  return {
    caregiverId: provider.id,
    nodeId: node.nodeId,
    minutes: DEMO_SESSION_MINUTES,
    supportTypes: [supportTypeByCategory[provider.category]],
    occurredAt: new Date().toISOString(),
  }
}
