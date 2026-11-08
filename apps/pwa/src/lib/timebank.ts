import { TIMEBANK_MIN_BALANCE, type Member, type Membership } from '@careledger/domain'
import Dexie, { type EntityTable } from 'dexie'

export interface BankMember extends Member {
  joinedAt: string
  identity: 'pendiente'
}

interface LedgerEntry {
  id: string
  hours: number
  createdAt: string
}

class BankDB extends Dexie {
  member!: EntityTable<BankMember, 'id'>
  ledger!: EntityTable<LedgerEntry, 'id'>

  constructor(name: string) {
    super(name)
    this.version(1).stores({ member: 'id', ledger: 'id, createdAt' })
  }
}

export interface BankOptions {
  dbName?: string
  now?: () => Date
}

const MEMBERSHIPS = ['demandante', 'vecino_cuidador'] satisfies readonly Membership[]

export function createBank(opts: BankOptions = {}) {
  const db = new BankDB(opts.dbName ?? 'entremanos-banco')
  const now = () => (opts.now ? opts.now() : new Date())

  return {
    minBalance: TIMEBANK_MIN_BALANCE,

    // El nivel no se declara: todos entran en N0 y N1/N2 se habilitan con
    // capacitación o certificado verificado (REQ-BT-009).
    async join(input: { membership: Membership }): Promise<void> {
      if (!MEMBERSHIPS.includes(input.membership)) {
        throw new Error('Alta inválida')
      }

      await db.transaction('rw', db.member, async () => {
        if ((await db.member.count()) > 0) throw new Error('Este teléfono ya tiene un miembro')
        await db.member.add({
          id: crypto.randomUUID(),
          membership: input.membership,
          level: 'N0',
          publicServant: false,
          joinedAt: now().toISOString(),
          identity: 'pendiente',
        })
      })
    },

    async member(): Promise<BankMember | null> {
      return (await db.member.toCollection().first()) ?? null
    },

    async balance(): Promise<number> {
      return (await db.ledger.toArray()).reduce((total, entry) => total + entry.hours, 0)
    },
  }
}

export type Bank = ReturnType<typeof createBank>
