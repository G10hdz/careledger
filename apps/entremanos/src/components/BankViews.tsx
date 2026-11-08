'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Level, Membership, ServiceKind } from '@careledger/domain'
import {
  createBank,
  type BankExchange,
  type BankMember,
  type BankService,
} from '@/lib/timebank'
import { btnGhost, btnPrimary, btnSecondary, card, choiceOff, choiceOn } from './styles'

const bank = createBank()

const MEMBERSHIPS: { value: Membership; label: string }[] = [
  { value: 'demandante', label: 'Cuido a un familiar' },
  { value: 'vecino_cuidador', label: 'Quiero cuidar' },
]

const ERROR_MESSAGES: Record<string, string> = {
  saldo: 'Llegarías a menos de -5 h',
  nivel: 'Tu nivel no permite ofrecer ese servicio',
  sin_cuidado: 'Todo intercambio incluye cuidado',
  duracion: 'Elige entre 0.5 y 8 h, en bloques de 15 minutos',
  tope_diario: 'Esa persona ya llegó a 8 h de servicio hoy',
  tope_pareja: 'Ya intercambiaron 20 h este mes entre ustedes dos',
  mismo_miembro: 'No puedes pedir tu propio servicio',
}

function membershipLabel(membership: Membership): string {
  return MEMBERSHIPS.find((option) => option.value === membership)?.label ?? membership
}

function serviceKindLabel(kind: ServiceKind): string {
  return kind === 'cuidado' ? 'Cuidado' : 'Oficio'
}

export function BankHome() {
  const [member, setMember] = useState<BankMember | null>()
  const [members, setMembers] = useState<BankMember[]>([])
  const [catalog, setCatalog] = useState<BankService[]>([])
  const [services, setServices] = useState<BankService[]>([])
  const [exchanges, setExchanges] = useState<BankExchange[]>([])
  const [balance, setBalance] = useState(0)
  const [alias, setAlias] = useState('')
  const [membership, setMembership] = useState<Membership>('demandante')
  const [hours, setHours] = useState(2)
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceKind, setServiceKind] = useState<ServiceKind>('cuidado')
  const [serviceLevel, setServiceLevel] = useState<Level>('N0')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [activeMember, allMembers] = await Promise.all([bank.current(), bank.members()])
    setMember(activeMember)
    setMembers(allMembers)
    if (!activeMember) {
      setBalance(0)
      setCatalog([])
      setServices([])
      setExchanges([])
      return
    }
    const [nextBalance, nextCatalog, nextServices, nextExchanges] = await Promise.all([
      bank.balance(activeMember.id),
      bank.catalog(),
      bank.servicesFor(activeMember.id),
      bank.exchangesFor(activeMember.id),
    ])
    setBalance(nextBalance)
    setCatalog(nextCatalog)
    setServices(nextServices)
    setExchanges(nextExchanges)
  }, [])

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('m')
    if (requested === 'cuidar') setMembership('vecino_cuidador')
    if (requested === 'familia') setMembership('demandante')

    let active = true
    void bank.seedDemo().then(async () => {
      if (active) await refresh()
    }).catch(() => {
      if (active) setError('No pudimos abrir el banco de tiempo en este teléfono.')
    })
    return () => {
      active = false
    }
  }, [refresh])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      await refresh()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : ''
      setError(ERROR_MESSAGES[message] ?? 'No pudimos completar la acción. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (member === undefined && error === null) {
    return <p className="text-base text-on-surface-variant">Cargando banco de tiempo…</p>
  }

  if (!member) {
    return (
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.17em]">Banco de tiempo · Piloto Iztapalapa</p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-5xl">
            Una hora de cuidado, <em className="text-[#829773]">una hora de vuelta.</em>
          </h1>
          <p className="mt-3 text-base text-on-surface-variant">Entra como una de las personas de prueba o crea tu cuenta.</p>
        </div>

        <section>
          <h2 className="font-display text-xl font-semibold">Entrar como</h2>
          <div className="mt-3 grid gap-3">
            {members.map((person) => (
              <button
                key={person.id}
                type="button"
                className={choiceOff}
                disabled={busy}
                onClick={() => void run(() => bank.login(person.id))}
              >
                <span>
                  <span className="block font-display text-lg font-semibold">{person.alias}</span>
                  <span className="block text-sm text-on-surface-variant">
                    {membershipLabel(person.membership)} · Nivel {person.level}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <form
          className={`${card} grid gap-4`}
          onSubmit={(event) => {
            event.preventDefault()
            void run(async () => {
              await bank.join({ alias, membership })
              setAlias('')
            })
          }}
        >
          <h2 className="font-display text-xl font-semibold">Crear mi cuenta</h2>
          <label className="grid gap-2 font-display font-semibold">
            Alias ficticio
            <input
              className="min-h-12 w-full rounded-full border border-outline bg-surface px-5 font-sans font-normal"
              value={alias}
              maxLength={40}
              required
              onChange={(event) => setAlias(event.target.value)}
            />
          </label>
          <fieldset>
            <legend className="font-display font-semibold">Membresía</legend>
            <div className="mt-2 grid gap-2">
              {MEMBERSHIPS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={membership === option.value}
                  className={membership === option.value ? choiceOn : choiceOff}
                  onClick={() => setMembership(option.value)}
                >
                  <span className="font-display font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button type="submit" className={btnPrimary} disabled={busy}>Crear y entrar</button>
        </form>

        {error ? <p className="text-base text-error" role="alert">{error}</p> : null}
      </div>
    )
  }

  const memberById = new Map(members.map((person) => [person.id, person]))
  const serviceById = new Map([...catalog, ...services].map((service) => [service.id, service]))
  const todo = exchanges.filter((exchange) => exchange.providerId === member.id && exchange.status === 'solicitado')
  const toConfirm = exchanges.filter((exchange) => exchange.receiverId === member.id && exchange.status === 'hecho')

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
      <header className="grid gap-3 lg:sticky lg:top-24">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-on-surface-variant">Sesión de</p>
            <h1 className="font-display text-4xl leading-tight">{member.alias}</h1>
          </div>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => void run(() => bank.logout())}>
            Cambiar de persona
          </button>
        </div>
        <section className="rounded-3xl bg-primary px-5 py-6 text-on-primary">
          <p className="font-display text-sm font-semibold">Saldo</p>
          <p className="mt-1 font-sans text-5xl font-bold tracking-tight">{balance} h</p>
          <p className="mt-2 text-sm">Nivel {member.level} · Identidad pendiente</p>
        </section>
      </header>

      <div className="flex min-w-0 flex-col gap-8">
      {error ? <p className="text-base text-error" role="alert">{error}</p> : null}

      <section>
        <h2 className="font-display text-xl font-semibold">Pedir</h2>
        <label className="mt-3 grid gap-2 font-display font-semibold">
          Horas
          <input
            className="min-h-12 w-full rounded-full border border-outline bg-surface px-5 font-sans text-lg font-normal md:max-w-[20rem]"
            type="number"
            min="0.5"
            max="8"
            step="0.25"
            value={hours}
            onChange={(event) => setHours(event.target.valueAsNumber)}
          />
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {catalog.map((service) => (
            <article key={service.id} className={`${card} grid gap-3`}>
              <div>
                <h3 className="font-display text-lg font-semibold">{service.title}</h3>
                <p className="text-sm text-on-surface-variant">
                  {memberById.get(service.memberId)?.alias} · {serviceKindLabel(service.kind)} · Nivel {service.minLevel}
                </p>
              </div>
              <button
                type="button"
                className={btnPrimary}
                disabled={busy}
                onClick={() => void run(async () => { await bank.request(service.id, hours) })}
              >
                Pedir {hours || 0} h
              </button>
            </article>
          ))}
        </div>
      </section>

      <ExchangeActions
        title="Por hacer"
        empty="No tienes servicios pendientes."
        exchanges={todo}
        services={serviceById}
        members={memberById}
        actionLabel="Ya lo hice"
        busy={busy}
        onAction={(id) => run(() => bank.markDone(id))}
      />

      <ExchangeActions
        title="Por confirmar"
        empty="No tienes horas por confirmar."
        exchanges={toConfirm}
        services={serviceById}
        members={memberById}
        actionLabel="Confirmar horas"
        busy={busy}
        onAction={(id) => run(() => bank.confirm(id))}
      />

      <section>
        <h2 className="font-display text-xl font-semibold">Historial</h2>
        {exchanges.length === 0 ? (
          <p className="mt-2 text-on-surface-variant">Todavía no hay intercambios.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {exchanges.map((exchange) => (
              <li key={exchange.id} className={card}>
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold">{serviceById.get(exchange.serviceId)?.title}</p>
                    <p className="text-sm capitalize text-on-surface-variant">{exchange.status}</p>
                  </div>
                  <p className={`font-display text-xl font-bold ${exchange.status === 'confirmado' ? '' : 'text-on-surface-variant'}`}>
                    {exchange.status === 'confirmado' ? (exchange.providerId === member.id ? '+' : '-') : ''}
                    {exchange.hours} h
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Mis servicios</h2>
        <ul className="mt-3 grid gap-2">
          {services.map((service) => (
            <li key={service.id} className={card}>
              <p className="font-display font-semibold">{service.title}</p>
              <p className="text-sm text-on-surface-variant">{serviceKindLabel(service.kind)} · Nivel {service.minLevel}</p>
            </li>
          ))}
        </ul>
        <form
          className={`${card} mt-3 grid gap-3`}
          onSubmit={(event) => {
            event.preventDefault()
            void run(async () => {
              await bank.addService({ title: serviceTitle, kind: serviceKind, minLevel: serviceLevel })
              setServiceTitle('')
            })
          }}
        >
          <label className="grid gap-2 font-display font-semibold">
            Servicio
            <input
              className="min-h-12 w-full rounded-full border border-outline bg-surface px-5 font-sans font-normal"
              value={serviceTitle}
              maxLength={80}
              required
              onChange={(event) => setServiceTitle(event.target.value)}
            />
          </label>
          <label className="grid gap-2 font-display font-semibold">
            Tipo
            <select className="min-h-12 w-full rounded-full border border-outline bg-surface px-5 font-sans font-normal" value={serviceKind} onChange={(event) => setServiceKind(event.target.value as ServiceKind)}>
              <option value="cuidado">Cuidado</option>
              <option value="oficio">Oficio</option>
            </select>
          </label>
          <label className="grid gap-2 font-display font-semibold">
            Nivel mínimo
            <select className="min-h-12 w-full rounded-full border border-outline bg-surface px-5 font-sans font-normal" value={serviceLevel} onChange={(event) => setServiceLevel(event.target.value as Level)}>
              <option value="N0">N0</option>
              <option value="N1">N1</option>
              <option value="N2">N2</option>
            </select>
          </label>
          <button type="submit" className={btnSecondary} disabled={busy}>Agregar servicio</button>
        </form>
      </section>
      </div>
    </div>
  )
}

function ExchangeActions({
  title,
  empty,
  exchanges,
  services,
  members,
  actionLabel,
  busy,
  onAction,
}: {
  title: string
  empty: string
  exchanges: BankExchange[]
  services: Map<string, BankService>
  members: Map<string, BankMember>
  actionLabel: string
  busy: boolean
  onAction: (id: string) => Promise<void>
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {exchanges.length === 0 ? (
        <p className="mt-2 text-on-surface-variant">{empty}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {exchanges.map((exchange) => {
            const otherId = title === 'Por hacer' ? exchange.receiverId : exchange.providerId
            return (
              <article key={exchange.id} className={`${card} grid gap-3`}>
                <div>
                  <h3 className="font-display font-semibold">{services.get(exchange.serviceId)?.title}</h3>
                  <p className="text-sm text-on-surface-variant">{members.get(otherId)?.alias} · {exchange.hours} h</p>
                </div>
                <button type="button" className={btnPrimary} disabled={busy} onClick={() => void onAction(exchange.id)}>
                  {actionLabel}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
