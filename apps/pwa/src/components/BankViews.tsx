'use client'

import { useEffect, useState } from 'react'
import type { Membership } from '@careledger/domain'
import { createBank, type BankMember } from '@/lib/timebank'
import { btnPrimary, card, choiceOff, choiceOn } from './styles'

const bank = createBank()

const MEMBERSHIPS: { value: Membership; label: string }[] = [
  { value: 'demandante', label: 'Cuido a un familiar' },
  { value: 'vecino_cuidador', label: 'Quiero cuidar' },
]

const LEVELS = [
  { value: 'N0', description: 'Sin requisito: compañía, compras, trámites, aseo y jardinería.' },
  { value: 'N1', description: 'Capacitación básica: movilización, comida asistida y medicamentos simples.' },
  { value: 'N2', description: 'Certificado o profesional: enfermería, terapia, odontología y fisioterapia.' },
]

function membershipLabel(membership: Membership): string {
  return MEMBERSHIPS.find((option) => option.value === membership)?.label ?? membership
}

export function BankHome() {
  const [member, setMember] = useState<BankMember | null>()
  const [balance, setBalance] = useState(0)
  const [membership, setMembership] = useState<Membership>('demandante')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('m')
    if (requested === 'cuidar') setMembership('vecino_cuidador')
    if (requested === 'familia') setMembership('demandante')

    let active = true
    void Promise.all([bank.member(), bank.balance()])
      .then(([savedMember, savedBalance]) => {
        if (!active) return
        setMember(savedMember)
        setBalance(savedBalance)
      })
      .catch(() => {
        if (active) setError('No pudimos abrir el banco de tiempo en este teléfono.')
      })
    return () => {
      active = false
    }
  }, [])

  async function join() {
    setBusy(true)
    setError(null)
    try {
      await bank.join({ membership })
      setMember(await bank.member())
      setBalance(await bank.balance())
    } catch {
      setError('No pudimos completar el alta. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (member === undefined && error === null) {
    return <p className="text-base text-on-surface-variant">Cargando banco de tiempo…</p>
  }

  if (member) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-[1.625rem] font-bold leading-8">Banco de tiempo</h1>
        <section className="rounded-2xl bg-primary px-4 py-5 text-on-primary">
          <p className="font-display text-sm font-semibold">Saldo</p>
          <p className="mt-1 font-display text-4xl font-bold">{balance} h</p>
        </section>
        <dl className={`${card} grid gap-3`}>
          <div>
            <dt className="font-display text-sm font-semibold">Membresía</dt>
            <dd>{membershipLabel(member.membership)}</dd>
          </div>
          <div>
            <dt className="font-display text-sm font-semibold">Nivel</dt>
            <dd>{member.level}</dd>
          </div>
          <div>
            <dt className="font-display text-sm font-semibold">Identidad</dt>
            <dd>Pendiente de verificar</dd>
          </div>
        </dl>
        <p className="text-base text-on-surface-variant">
          Puedes quedar hasta {Math.abs(bank.minBalance)} horas por debajo de cero.
        </p>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void join()
      }}
    >
      <div>
        <h1 className="font-display text-[1.625rem] font-bold leading-8">Únete al banco de tiempo</h1>
        <p className="mt-2 text-base text-on-surface-variant">Elige cómo quieres participar.</p>
      </div>

      <fieldset>
        <legend className="font-display text-lg font-semibold">Membresía</legend>
        <div className="mt-3 grid gap-3">
          {MEMBERSHIPS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={membership === option.value}
              className={membership === option.value ? choiceOn : choiceOff}
              onClick={() => setMembership(option.value)}
            >
              <span className="font-display text-base font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <section className={`${card} grid gap-2`}>
        <h2 className="font-display text-lg font-semibold">Empiezas en nivel N0</h2>
        <ul className="grid gap-2 text-sm leading-5 text-on-surface-variant">
          {LEVELS.map((option) => (
            <li key={option.value}>
              <span className="font-display font-semibold text-on-surface">{option.value}.</span> {option.description}
            </li>
          ))}
        </ul>
        <p className="text-sm text-on-surface-variant">
          N1 y N2 se habilitan con capacitación o certificado verificado. La hora vale lo mismo en todos los niveles.
        </p>
      </section>

      {error ? <p className="text-base text-error" role="alert">{error}</p> : null}
      <button type="submit" className={btnPrimary} disabled={busy}>
        {busy ? 'Guardando…' : 'Unirme'}
      </button>
    </form>
  )
}
