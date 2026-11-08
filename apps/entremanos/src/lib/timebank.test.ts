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

type TestBank = ReturnType<typeof bank>

async function exchange(timebank: TestBank, receiverId: string, providerId: string, title: string, hours: number) {
  await timebank.login(receiverId)
  const service = (await timebank.catalog()).find((item) => item.title === title)!
  const request = await timebank.request(service.id, hours)
  await timebank.login(providerId)
  await timebank.markDone(request.id)
  await timebank.login(receiverId)
  await timebank.confirm(request.id)
}

describe('banco de tiempo local', () => {
  it('acepta bloques de 15 minutos', async () => {
    const { timebank, ana, luis } = await demoBank()
    await exchange(timebank, ana.id, luis.id, 'Acompañar a cita médica', 1.25)
    expect(await timebank.balance(luis.id)).toBe(1.25)
  })

  it('rechaza pasar de 8 h al día como proveedor', async () => {
    const { timebank, ana, luis } = await demoBank()
    await exchange(timebank, ana.id, luis.id, 'Acompañar a cita médica', 4)
    const otra = await timebank.join({ alias: 'Rosa', membership: 'demandante' })
    await exchange(timebank, otra.id, luis.id, 'Acompañar a cita médica', 4)
    await timebank.join({ alias: 'Eva', membership: 'demandante' })
    const cita = (await timebank.catalog()).find((item) => item.title === 'Acompañar a cita médica')!
    await expect(timebank.request(cita.id, 0.5)).rejects.toThrow('tope_diario')
  })

  it('rechaza pasar de 20 h al mes entre la misma pareja', async () => {
    let now = new Date('2026-11-01T15:00:00.000Z')
    const dbName = `timebank-${crypto.randomUUID()}`
    databases.push(dbName)
    const timebank = createBank({ dbName, now: () => now })
    await timebank.seedDemo()
    for (let day = 1; day <= 5; day++) {
      now = new Date(`2026-11-0${day}T15:00:00.000Z`)
      await exchange(timebank, 'demo-ana', 'demo-luis', 'Acompañar a cita médica', 2)
      await exchange(timebank, 'demo-luis', 'demo-ana', 'Corte de cabello', 2)
    }
    await timebank.login('demo-ana')
    const cita = (await timebank.catalog()).find((item) => item.title === 'Acompañar a cita médica')!
    await expect(timebank.request(cita.id, 0.5)).rejects.toThrow('tope_pareja')
  })

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
