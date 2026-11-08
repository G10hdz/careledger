import {
  TIMEBANK_MIN_BALANCE,
  applyExchange,
  confirmHours,
  validateExchange,
  type Level,
  type Member,
  type Membership,
  type ServiceKind,
  type TimebankService,
} from '@careledger/domain'
import Dexie, { type EntityTable } from 'dexie'

export interface BankMember extends Member {
  alias: string
  joinedAt: string
  identity: 'pendiente'
}

export interface BankService extends TimebankService {
  memberId: string
  title: string
}

export interface BankExchange {
  id: string
  serviceId: string
  providerId: string
  receiverId: string
  hours: number
  status: 'solicitado' | 'hecho' | 'confirmado'
  createdAt: string
  confirmedAt?: string
}

interface LedgerEntry {
  id: string
  memberId: string
  hours: number
  exchangeId: string
  createdAt: string
}

interface MetaEntry {
  id: 'session'
  memberId: string
}

class BankDB extends Dexie {
  members!: EntityTable<BankMember, 'id'>
  services!: EntityTable<BankService, 'id'>
  exchanges!: EntityTable<BankExchange, 'id'>
  ledger!: EntityTable<LedgerEntry, 'id'>
  meta!: EntityTable<MetaEntry, 'id'>

  constructor(name: string) {
    super(name)
    this.version(1).stores({ member: 'id', ledger: 'id, createdAt' })
    this.version(2).stores({
      member: 'id',
      members: 'id, alias',
      services: 'id, memberId',
      exchanges: 'id, providerId, receiverId, createdAt',
      ledger: 'id, memberId, exchangeId, createdAt',
      meta: 'id',
    })
  }
}

export interface BankOptions {
  dbName?: string
  now?: () => Date
}

const MEMBERSHIPS = ['demandante', 'vecino_cuidador'] satisfies readonly Membership[]
const LEVELS = ['N0', 'N1', 'N2'] satisfies readonly Level[]
const KINDS = ['cuidado', 'oficio'] satisfies readonly ServiceKind[]

export function createBank(opts: BankOptions = {}) {
  const db = new BankDB(opts.dbName ?? 'entremanos-banco')
  const now = () => (opts.now ? opts.now() : new Date())

  async function current(): Promise<BankMember | null> {
    const session = await db.meta.get('session')
    return session ? (await db.members.get(session.memberId)) ?? null : null
  }

  async function active(): Promise<BankMember> {
    const member = await current()
    if (!member) throw new Error('sesion')
    return member
  }

  async function balance(memberId?: string): Promise<number> {
    const id = memberId ?? (await active()).id
    return (await db.ledger.where('memberId').equals(id).toArray()).reduce(
      (total, entry) => total + entry.hours,
      0,
    )
  }

  function reject(reason: string): never {
    throw new Error(reason)
  }

  async function validate(service: BankService, receiver: BankMember, hours: number) {
    const provider = await db.members.get(service.memberId)
    if (!provider) throw new Error('servicio')
    const counterService =
      service.kind === 'oficio'
        ? await db.services.where('memberId').equals(receiver.id).filter((item) => item.kind === 'cuidado').first()
        : undefined
    const result = validateExchange({
      provider,
      receiver,
      service,
      ...(counterService ? { counterService } : {}),
      hours,
      receiverBalance: await balance(receiver.id),
    })
    if (!result.ok) reject(result.reason)
    return provider
  }

  return {
    minBalance: TIMEBANK_MIN_BALANCE,

    async seedDemo(): Promise<void> {
      await db.transaction('rw', db.members, db.services, async () => {
        const joinedAt = now().toISOString()
        const demoMembers: BankMember[] = [
          {
            id: 'demo-ana',
            alias: 'Ana',
            membership: 'demandante',
            level: 'N0',
            publicServant: false,
            identity: 'pendiente',
            joinedAt,
          },
          {
            id: 'demo-luis',
            alias: 'Luis',
            membership: 'vecino_cuidador',
            level: 'N1',
            publicServant: false,
            identity: 'pendiente',
            joinedAt,
          },
        ]
        const demoServices: BankService[] = [
          { id: 'demo-corte', memberId: 'demo-ana', title: 'Corte de cabello', kind: 'oficio', minLevel: 'N0' },
          { id: 'demo-cita', memberId: 'demo-luis', title: 'Acompañar a cita médica', kind: 'cuidado', minLevel: 'N0' },
          { id: 'demo-relevo', memberId: 'demo-luis', title: 'Cuidar a adulto mayor en casa', kind: 'cuidado', minLevel: 'N1' },
        ]
        for (const member of demoMembers) {
          if (!(await db.members.get(member.id))) await db.members.add(member)
        }
        for (const service of demoServices) {
          if (!(await db.services.get(service.id))) await db.services.add(service)
        }
      })
    },

    async login(memberId: string): Promise<void> {
      if (!(await db.members.get(memberId))) throw new Error('miembro')
      await db.meta.put({ id: 'session', memberId })
    },

    async logout(): Promise<void> {
      await db.meta.delete('session')
    },

    current,

    async members(): Promise<BankMember[]> {
      return db.members.toArray()
    },

    async join(input: { alias: string; membership: Membership }): Promise<BankMember> {
      const alias = input.alias.trim()
      if (!alias || alias.length > 40 || !MEMBERSHIPS.includes(input.membership)) throw new Error('alta')
      const member: BankMember = {
        id: crypto.randomUUID(),
        alias,
        membership: input.membership,
        level: 'N0',
        publicServant: false,
        joinedAt: now().toISOString(),
        identity: 'pendiente',
      }
      await db.transaction('rw', db.members, db.meta, async () => {
        await db.members.add(member)
        await db.meta.put({ id: 'session', memberId: member.id })
      })
      return member
    },

    async addService(input: { title: string; kind: ServiceKind; minLevel: Level }): Promise<BankService> {
      const member = await active()
      const title = input.title.trim()
      if (!title || title.length > 80 || !KINDS.includes(input.kind) || !LEVELS.includes(input.minLevel)) {
        throw new Error('servicio')
      }
      const service = { id: crypto.randomUUID(), memberId: member.id, title, kind: input.kind, minLevel: input.minLevel }
      await db.services.add(service)
      return service
    },

    async servicesFor(memberId?: string): Promise<BankService[]> {
      const id = memberId ?? (await active()).id
      return db.services.where('memberId').equals(id).toArray()
    },

    async catalog(): Promise<BankService[]> {
      const member = await active()
      return db.services.filter((service) => service.memberId !== member.id).toArray()
    },

    async request(serviceId: string, hours: number): Promise<BankExchange> {
      const receiver = await active()
      const service = await db.services.get(serviceId)
      if (!service) throw new Error('servicio')
      const provider = await validate(service, receiver, hours)
      const exchange: BankExchange = {
        id: crypto.randomUUID(),
        serviceId,
        providerId: provider.id,
        receiverId: receiver.id,
        hours,
        status: 'solicitado',
        createdAt: now().toISOString(),
      }
      await db.exchanges.add(exchange)
      return exchange
    },

    async markDone(exchangeId: string): Promise<void> {
      const member = await active()
      await db.transaction('rw', db.exchanges, async () => {
        const exchange = await db.exchanges.get(exchangeId)
        if (!exchange || exchange.providerId !== member.id || exchange.status !== 'solicitado') {
          throw new Error('estado')
        }
        await db.exchanges.update(exchangeId, { status: 'hecho' })
      })
    },

    async confirm(exchangeId: string): Promise<void> {
      const receiver = await active()
      await db.transaction('rw', db.exchanges, db.services, db.members, db.ledger, async () => {
        const exchange = await db.exchanges.get(exchangeId)
        if (!exchange || exchange.receiverId !== receiver.id || exchange.status !== 'hecho') throw new Error('estado')
        const confirmation = confirmHours({
          providerId: exchange.providerId,
          hours: exchange.hours,
          confirmation: { by: 'familia', confirmerId: receiver.id },
        })
        if (!confirmation.ok) reject(confirmation.reason)
        const service = await db.services.get(exchange.serviceId)
        if (!service) throw new Error('servicio')
        await validate(service, receiver, exchange.hours)
        const previousBalances = {
          [exchange.providerId]: await balance(exchange.providerId),
          [receiver.id]: await balance(receiver.id),
        }
        const balances = applyExchange(
          previousBalances,
          exchange.providerId,
          receiver.id,
          confirmation.credited,
        )
        const createdAt = now().toISOString()
        await db.ledger.bulkAdd([
          { id: crypto.randomUUID(), memberId: exchange.providerId, hours: (balances[exchange.providerId] ?? 0) - previousBalances[exchange.providerId]!, exchangeId, createdAt },
          { id: crypto.randomUUID(), memberId: receiver.id, hours: (balances[receiver.id] ?? 0) - previousBalances[receiver.id]!, exchangeId, createdAt },
        ])
        await db.exchanges.update(exchangeId, { status: 'confirmado', confirmedAt: createdAt })
      })
    },

    balance,

    async exchangesFor(memberId?: string): Promise<BankExchange[]> {
      const id = memberId ?? (await active()).id
      return db.exchanges
        .filter((exchange) => exchange.providerId === id || exchange.receiverId === id)
        .reverse()
        .sortBy('createdAt')
    },
  }
}

export type Bank = ReturnType<typeof createBank>
