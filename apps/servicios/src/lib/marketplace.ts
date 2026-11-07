import type { CareSession } from '@careledger/domain'

export const categories = ['Medicina', 'Terapia', 'Fisioterapia', 'Enfermería', 'Transporte especializado'] as const
export type Category = typeof categories[number]
export type Provider = { id: string; name: string; category: Category; zones: string[]; price: number; public: boolean; availability: string; certification: string; accredited: boolean }
export type Status = 'enviada' | 'aceptada' | 'agendada' | 'completada' | 'rechazada'
export type Request = { id: string; providerId: string; category: Category; zone: string; budgetMin: number; budgetMax: number; schedule: string; status: Status }
export type FutureCareSession = Pick<CareSession, 'caregiverId' | 'nodeId' | 'minutes' | 'supportTypes' | 'occurredAt'>

export function filterProviders(providers: Provider[], zone: string, min: number, max: number, category: string): Provider[] {
  return providers.filter(p => p.zones.includes(zone) && (!category || p.category === category)).sort((a, b) => Number(b.price >= min && b.price <= max) - Number(a.price >= min && a.price <= max))
}
const transitions: Record<Status, Status[]> = { enviada: ['aceptada', 'rechazada'], aceptada: ['agendada'], agendada: ['completada'], completada: [], rechazada: [] }
export function transition(request: Request, next: Status): Request {
  if (!transitions[request.status].includes(next)) throw new Error('Transición inválida')
  return { ...request, status: next }
}
