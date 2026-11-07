'use client'

import Link from 'next/link'
import type { SupportType } from '@careledger/domain'
import type { AttestationView } from '@/lib/app'
import { receiptPdf } from '@/lib/documents'
import { downloadBytes } from '@/lib/download'
import { formatDuration, formatWhen } from '@/lib/format'
import { useCare } from './Provider'
import { btnPrimary, btnSecondary, card } from './styles'

const SUPPORT_KEY: Record<SupportType, 'supMed' | 'supFood' | 'supCog' | 'supNight' | 'supOther'> = {
  acompanamiento_medico: 'supMed',
  alimentacion_aseo: 'supFood',
  estimulacion_cognitiva: 'supCog',
  guardia_nocturna: 'supNight',
  otro: 'supOther',
}

function titleOf(view: AttestationView, t: ReturnType<typeof useCare>['t']): string {
  if (view.kind === 'autocuidado') {
    if (view.selfCareType === 'tiempo_libre') return t('selfFree')
    if (view.selfCareType === 'hidratacion_descanso') return t('selfWater')
    if (view.selfCareType === 'red_de_apoyo') return t('selfNet')
    return t('selfCare')
  }
  if (view.category === 'familiar_dependiente') return t('familiar')
  if (view.category === 'vecino_adulto_mayor') return t('elder')
  if (view.category === 'infancias_comunitarias') return t('children')
  return t('care')
}

export function ImpactList() {
  const { snap, t, lang } = useCare()
  if (!snap) return null
  return (
    <div>
      <h1 className="font-display text-[1.625rem] font-bold leading-8">{t('impactTitle')}</h1>
      {snap.attestations.length === 0 ? <p className="mt-3 text-base text-on-surface-variant">{t('impactEmpty')}</p> : null}
      <ul className="mt-4 flex flex-col gap-2">
        {snap.attestations.map((item) => (
          <li key={item.sessionId}>
            <Link href={`/impacto/${item.sessionId}`} className={`${card} block min-h-16`} data-testid={`record-${item.sessionId}`}>
              <span className="font-display text-base font-semibold">{titleOf(item, t)}</span>
              <span className="mt-1 block text-sm text-on-surface-variant">
                {formatDuration(item.minutes)} · {formatWhen(item.occurredAt, lang)} ·{' '}
                {item.status === 'validada' ? t('validatedState') : item.status === 'pendiente' ? t('pendingState') : t('rejectedState')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Receipt({ id }: { id: string }) {
  const { snap, t, lang } = useCare()
  if (!snap) return null
  const view = snap.attestations.find((item) => item.sessionId === id)
  if (!view) return <p className="text-base">{t('impactEmpty')}</p>
  const signed = [view.signatures.cuidadora, view.signatures.beneficiario, view.signatures.veedor].filter(Boolean).length

  return (
    <article className="flex flex-col gap-4" data-testid="receipt">
      {view.status === 'pendiente' ? (
        <header>
          <h1 className="font-display text-[1.625rem] font-bold leading-8" data-testid="receipt-status">
            {t('waitingTitle')}
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">{t('waitingBody')}</p>
        </header>
      ) : null}
      {view.status === 'validada' ? (
        <header className="rounded-2xl bg-primary px-4 py-5 text-on-primary">
          <h1 className="font-display text-[1.625rem] font-bold leading-8" data-testid="receipt-status">
            {t('validatedTitle')}
          </h1>
          <p className="mt-2 font-display text-3xl font-bold" data-testid="receipt-points">
            {t('pointsIssued', { n: view.points ?? 0, points: t('pointsName') })}
          </p>
          {view.socialValueUsd !== null ? (
            <p className="mt-2 text-base">
              {t('socialValue')}: {view.socialValueUsd} USD
            </p>
          ) : null}
        </header>
      ) : null}
      {view.status === 'rechazada' || view.status === 'expirada' ? (
        <header>
          <h1 className="font-display text-[1.625rem] font-bold leading-8 text-error" data-testid="receipt-status">
            {t('rejectedTitle')}
          </h1>
          <p className="mt-2 text-base">{view.motivo === 'firma' ? t('motivoFirma') : t('motivoPlazo')}</p>
        </header>
      ) : null}

      <section className={card}>
        <p className="font-display text-sm font-semibold">{t('ofThree', { n: signed })}</p>
        <ul className="mt-2 flex flex-col gap-2 text-base">
          <li>
            {t('care')}: {view.signatures.cuidadora ? t('signed') : t('waiting')}
          </li>
          <li>
            {t('waitingPerson')}: {view.signatures.beneficiario ? t('signed') : t('waiting')}
          </li>
          <li>
            {t('waitingVeedor')}: {view.signatures.veedor ? t('signed') : t('waiting')}
          </li>
        </ul>
      </section>

      <dl className={`${card} grid gap-3`}>
        <div>
          <dt className="font-display text-sm font-semibold">{t('category')}</dt>
          <dd>{titleOf(view, t)}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold">{t('duration')}</dt>
          <dd>{formatDuration(view.minutes)}</dd>
        </div>
        {view.supportTypes.length > 0 ? (
          <div>
            <dt className="font-display text-sm font-semibold">{t('supports')}</dt>
            <dd>{view.supportTypes.map((item) => t(SUPPORT_KEY[item])).join(', ')}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-display text-sm font-semibold">{t('when')}</dt>
          <dd>{formatWhen(view.occurredAt, lang)}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold">{t('nodeActive')}</dt>
          <dd>{snap.nodeName}</dd>
        </div>
        {view.folio ? (
          <div>
            <dt className="font-display text-sm font-semibold">{t('folio')}</dt>
            <dd className="font-display text-xl font-bold tracking-wide" data-testid="receipt-folio">
              {view.folio}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-display text-sm font-semibold">{t('hash')}</dt>
          <dd className="break-all text-sm">{view.canonicalHash}</dd>
        </div>
        {view.needsAudit ? <p className="text-sm text-on-tertiary-fixed">{t('auditFlag')}</p> : null}
      </dl>

      {view.status === 'validada' && view.folio ? (
        <button
          type="button"
          className={btnSecondary}
          onClick={() => downloadBytes(`comprobante-${view.folio}.pdf`, receiptPdf(view, snap.nodeName), 'application/pdf')}
        >
          {t('downloadPdf')}
        </button>
      ) : null}
      <Link href="/billetera" className={btnPrimary}>
        {t('goWallet')}
      </Link>
    </article>
  )
}
