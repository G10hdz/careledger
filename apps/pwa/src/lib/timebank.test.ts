import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { createBank } from './timebank'

const databases: string[] = []

function bank() {
  const dbName = `timebank-${crypto.randomUUID()}`
  databases.push(dbName)
  return createBank({
    dbName,
    now: () => new Date('2026-11-07T15:00:00.000Z'),
  })
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((name) => Dexie.delete(name)))
})

describe('alta en el banco de tiempo', () => {
  it('guarda la membresía y arranca en N0', async () => {
    const timebank = bank()

    await timebank.join({ membership: 'demandante' })

    expect(await timebank.member()).toMatchObject({
      membership: 'demandante',
      level: 'N0',
      joinedAt: '2026-11-07T15:00:00.000Z',
    })
  })

  it('inicia con saldo de cero horas', async () => {
    const timebank = bank()

    await timebank.join({ membership: 'vecino_cuidador' })

    expect(await timebank.balance()).toBe(0)
  })

  it('rechaza una segunda alta en el mismo dispositivo', async () => {
    const timebank = bank()
    await timebank.join({ membership: 'demandante' })

    await expect(timebank.join({ membership: 'vecino_cuidador' })).rejects.toThrow()
  })

  it('ignora un nivel enviado en el alta', async () => {
    const timebank = bank()

    await timebank.join({ membership: 'vecino_cuidador', level: 'N2' } as never)

    expect((await timebank.member())?.level).toBe('N0')
  })

  it.each([{ membership: 'otra' }, { membership: undefined }])('rechaza membresías inválidas', async (input) => {
    const timebank = bank()

    await expect(timebank.join(input as never)).rejects.toThrow()
    expect(await timebank.member()).toBeNull()
  })

  it('guarda solo los datos mínimos y deja la identidad pendiente', async () => {
    const timebank = bank()
    await timebank.join({ membership: 'demandante' })

    const member = await timebank.member()
    expect(member?.identity).toBe('pendiente')
    expect(Object.keys(member ?? {}).sort()).toEqual([
      'id',
      'identity',
      'joinedAt',
      'level',
      'membership',
      'publicServant',
    ])
  })
})
