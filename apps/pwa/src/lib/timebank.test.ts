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

async function demoBank() {
  const timebank = bank()
  await timebank.seedDemo()
  const members = await timebank.members()
  const ana = members.find((member) => member.alias === 'Ana')!
  const luis = members.find((member) => member.alias === 'Luis')!
  return { timebank, ana, luis }
}

describe('banco de tiempo local', () => {
  it('siembra la demo una sola vez', async () => {
    const timebank = bank()

    await timebank.seedDemo()
    await timebank.seedDemo()

    expect((await timebank.members()).map((member) => member.alias).sort()).toEqual(['Ana', 'Luis'])
    await timebank.login((await timebank.members()).find((member) => member.alias === 'Ana')!.id)
    expect((await timebank.catalog()).map((service) => service.title).sort()).toEqual([
      'Acompañar a cita médica',
      'Cuidar a adulto mayor en casa',
    ])
  })

  it('inicia y cierra sesión', async () => {
    const { timebank, ana } = await demoBank()

    expect(await timebank.current()).toBeNull()
    await timebank.login(ana.id)
    expect((await timebank.current())?.alias).toBe('Ana')
    await timebank.logout()
    expect(await timebank.current()).toBeNull()
    await expect(timebank.login('no-existe')).rejects.toThrow()
  })

  it('completa el recorrido de Ana y Luis conservando la suma de horas', async () => {
    const { timebank, ana, luis } = await demoBank()
    await timebank.login(ana.id)
    const cita = (await timebank.catalog()).find((service) => service.title === 'Acompañar a cita médica')!
    const cuidado = await timebank.request(cita.id, 2)

    await timebank.login(luis.id)
    await timebank.markDone(cuidado.id)
    await timebank.login(ana.id)
    await timebank.confirm(cuidado.id)
    expect(await timebank.balance(ana.id)).toBe(-2)
    expect(await timebank.balance(luis.id)).toBe(2)
    expect((await timebank.balance(ana.id)) + (await timebank.balance(luis.id))).toBe(0)

    await timebank.login(luis.id)
    const corte = (await timebank.catalog()).find((service) => service.title === 'Corte de cabello')!
    const oficio = await timebank.request(corte.id, 2)
    await timebank.login(ana.id)
    await timebank.markDone(oficio.id)
    await timebank.login(luis.id)
    await timebank.confirm(oficio.id)
    expect(await timebank.balance(ana.id)).toBe(0)
    expect(await timebank.balance(luis.id)).toBe(0)
  })

  it('solo permite al proveedor marcar hecho', async () => {
    const { timebank, ana } = await demoBank()
    await timebank.login(ana.id)
    const exchange = await timebank.request((await timebank.catalog())[0]!.id, 2)

    await expect(timebank.markDone(exchange.id)).rejects.toThrow()
  })

  it('solo permite al receptor confirmar y no confirma dos veces', async () => {
    const { timebank, ana, luis } = await demoBank()
    await timebank.login(ana.id)
    const exchange = await timebank.request((await timebank.catalog())[0]!.id, 2)
    await timebank.login(luis.id)
    await timebank.markDone(exchange.id)
    await expect(timebank.confirm(exchange.id)).rejects.toThrow()
    await timebank.login(ana.id)
    await timebank.confirm(exchange.id)
    await expect(timebank.confirm(exchange.id)).rejects.toThrow()
  })

  it('rechaza pedir por debajo del saldo mínimo', async () => {
    const { timebank, ana } = await demoBank()
    await timebank.login(ana.id)

    await expect(timebank.request((await timebank.catalog())[0]!.id, 5.5)).rejects.toThrow('saldo')
  })

  it('rechaza un oficio si quien lo pide no ofrece cuidado', async () => {
    const { timebank, ana } = await demoBank()
    const mara = await timebank.join({ alias: 'Mara', membership: 'demandante' })
    await timebank.login(mara.id)
    const corte = (await timebank.catalog()).find((service) => service.memberId === ana.id)!

    await expect(timebank.request(corte.id, 2)).rejects.toThrow('sin_cuidado')
  })

  it('rechaza pedir un servicio propio', async () => {
    const { timebank, ana } = await demoBank()
    await timebank.login(ana.id)
    const service = await timebank.addService({ title: 'Compras', kind: 'cuidado', minLevel: 'N0' })

    await expect(timebank.request(service.id, 2)).rejects.toThrow('mismo_miembro')
  })

  it.each(['', '  ', 'a'.repeat(41)])('rechaza alias inválido', async (alias) => {
    const timebank = bank()

    await expect(timebank.join({ alias, membership: 'demandante' })).rejects.toThrow()
  })
})
