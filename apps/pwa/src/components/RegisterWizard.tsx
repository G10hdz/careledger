'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { BeneficiaryCategory, SelfCareType, SupportType } from '@careledger/domain'
import { pointsPreview } from '@/lib/app'
import { formatDuration } from '@/lib/format'
import { careApp } from '@/lib/singleton'
import { TIME_PRESETS, canContinue, canSign, initialWizard, wizard, type WizardState } from '@/lib/wizard'
import { useCare } from './Provider'
import { btnPrimary, chipOff, chipOn, choiceOff, choiceOn } from './styles'

const CATEGORIES: { id: BeneficiaryCategory; title: 'familiar' | 'elder' | 'children'; hint: 'familiarHint' | 'elderHint' | 'childrenHint' }[] = [
  { id: 'familiar_dependiente', title: 'familiar', hint: 'familiarHint' },
  { id: 'vecino_adulto_mayor', title: 'elder', hint: 'elderHint' },
  { id: 'infancias_comunitarias', title: 'children', hint: 'childrenHint' },
]

const SELVES: { id: SelfCareType; title: 'selfFree' | 'selfWater' | 'selfNet'; hint: 'selfFreeHint' | 'selfWaterHint' | 'selfNetHint' }[] = [
  { id: 'tiempo_libre', title: 'selfFree', hint: 'selfFreeHint' },
  { id: 'hidratacion_descanso', title: 'selfWater', hint: 'selfWaterHint' },
  { id: 'red_de_apoyo', title: 'selfNet', hint: 'selfNetHint' },
]

const SUPPORTS: { id: SupportType; label: 'supMed' | 'supFood' | 'supCog' | 'supNight' | 'supOther' }[] = [
  { id: 'acompanamiento_medico', label: 'supMed' },
  { id: 'alimentacion_aseo', label: 'supFood' },
  { id: 'estimulacion_cognitiva', label: 'supCog' },
  { id: 'guardia_nocturna', label: 'supNight' },
  { id: 'otro', label: 'supOther' },
]

export function RegisterWizard({ kind }: { kind: WizardState['kind'] }) {
  const { t, snap } = useCare()
  const router = useRouter()
  const [state, setState] = useState(() => initialWizard(kind))
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const stamp = useRef<string | null>(null)

  useEffect(() => {
    if (state.step === 3 && !stamp.current) stamp.current = new Date().toISOString()
    if (state.step < 3) stamp.current = null
  }, [state.step])

  if (!snap) return null

  const preview = pointsPreview(kind, state.minutes, snap.selfCareWeekPoints)
  const hours = Math.floor(state.minutes / 60)
  const mins = state.minutes % 60

  async function sign() {
    if (!canSign(state) || busy) return
    setBusy(true)
    setNote(null)
    try {
      const occurredAt = stamp.current ?? new Date().toISOString()
      const draft =
        state.kind === 'cuidado'
          ? {
              kind: 'cuidado' as const,
              category: state.category ?? 'familiar_dependiente',
              supportTypes: state.supportTypes,
              minutes: state.minutes,
              occurredAt,
            }
          : {
              kind: 'autocuidado' as const,
              selfCareType: state.selfCareType ?? 'tiempo_libre',
              minutes: state.minutes,
              occurredAt,
            }
      if (state.kind === 'cuidado' && !state.category) return
      if (state.kind === 'autocuidado' && !state.selfCareType) return
      const { sessionId } = await careApp().submit(draft)
      router.push(`/impacto/${sessionId}`)
    } catch {
      setNote(t('saveError'))
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-sm font-semibold text-primary">{t('step', { n: state.step })}</p>
      {state.step === 1 ? (
        <section>
          <h1 className="font-display text-[1.625rem] font-bold leading-8 text-on-surface" data-testid="step-title">
            {kind === 'cuidado' ? t('whoToday') : t('selfWho')}
          </h1>
          <p className="mt-1 text-sm font-semibold text-primary">{t('required')}</p>
          <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label={kind === 'cuidado' ? t('whoToday') : t('selfWho')}>
            {kind === 'cuidado'
              ? CATEGORIES.map((item) => {
                  const on = state.category === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      data-testid={`who-${item.id}`}
                      className={on ? choiceOn : choiceOff}
                      onClick={() => setState((current) => wizard(current, { type: 'pick-category', category: item.id }))}
                    >
                      <span>
                        <span className="block font-display text-lg font-semibold">{t(item.title)}</span>
                        <span className="mt-0.5 block text-sm text-on-surface-variant">{t(item.hint)}</span>
                      </span>
                    </button>
                  )
                })
              : SELVES.map((item) => {
                  const on = state.selfCareType === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      data-testid={`self-${item.id}`}
                      className={on ? choiceOn : choiceOff}
                      onClick={() => setState((current) => wizard(current, { type: 'pick-self', selfCareType: item.id }))}
                    >
                      <span>
                        <span className="block font-display text-lg font-semibold">{t(item.title)}</span>
                        <span className="mt-0.5 block text-sm text-on-surface-variant">{t(item.hint)}</span>
                      </span>
                    </button>
                  )
                })}
          </div>
        </section>
      ) : null}

      {state.step === 2 ? (
        <section>
          <h1 className="font-display text-[1.625rem] font-bold leading-8" data-testid="step-title">
            {t('timeSpent')}
          </h1>
          <p className="mt-2 font-display text-3xl font-bold text-primary" data-testid="duration">
            {formatDuration(state.minutes)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stepper
              label={t('hours')}
              value={hours}
              lessLabel={t('lessHours')}
              moreLabel={t('moreHours')}
              testid="hours"
              onLess={() => setState((current) => wizard(current, { type: 'set-minutes', minutes: current.minutes - 60 }))}
              onMore={() => setState((current) => wizard(current, { type: 'set-minutes', minutes: current.minutes + 60 }))}
            />
            <Stepper
              label={t('minutes')}
              value={mins}
              lessLabel={t('lessMinutes')}
              moreLabel={t('moreMinutes')}
              testid="minutes"
              onLess={() => setState((current) => wizard(current, { type: 'set-minutes', minutes: current.minutes - 5 }))}
              onMore={() => setState((current) => wizard(current, { type: 'set-minutes', minutes: current.minutes + 5 }))}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                data-testid={`preset-${preset.id}`}
                className={state.minutes === preset.minutes ? chipOn : chipOff}
                onClick={() => setState((current) => wizard(current, { type: 'set-minutes', minutes: preset.minutes }))}
              >
                {preset.id === '1h' ? t('preset1') : preset.id === '2h30' ? t('preset2') : preset.id === '3h30' ? t('preset3') : t('preset5')}
              </button>
            ))}
          </div>
          {kind === 'cuidado' ? (
            <div className="mt-5">
              <h2 className="font-display text-lg font-semibold">{t('supportTypes')}</h2>
              <p className="text-sm text-on-surface-variant">{t('pickSeveral')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUPPORTS.map((item) => {
                  const on = state.supportTypes.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={on}
                      data-testid={`support-${item.id}`}
                      className={on ? chipOn : chipOff}
                      onClick={() => setState((current) => wizard(current, { type: 'toggle-support', support: item.id }))}
                    >
                      {t(item.label)}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          {state.minutes < 5 ? <p className="mt-3 text-sm text-error">{t('notEnoughTime')}</p> : null}
          {kind === 'cuidado' && state.supportTypes.length === 0 ? <p className="mt-2 text-sm text-on-surface-variant">{t('pickSupport')}</p> : null}
        </section>
      ) : null}

      {state.step === 3 ? (
        <section>
          <h1 className="font-display text-[1.625rem] font-bold leading-8" data-testid="step-title">
            {t('review')}
          </h1>
          <dl className="mt-3 flex flex-col gap-2 text-base">
            <div>
              <dt className="font-display text-sm font-semibold">{t('duration')}</dt>
              <dd>{formatDuration(state.minutes)}</dd>
            </div>
            <div>
              <dt className="font-display text-sm font-semibold">{t('category')}</dt>
              <dd>
                {kind === 'cuidado'
                  ? t(CATEGORIES.find((item) => item.id === state.category)?.title ?? 'care')
                  : t(SELVES.find((item) => item.id === state.selfCareType)?.title ?? 'selfCare')}
              </dd>
            </div>
            {kind === 'cuidado' ? (
              <div>
                <dt className="font-display text-sm font-semibold">{t('supports')}</dt>
                <dd>{state.supportTypes.map((id) => t(SUPPORTS.find((item) => item.id === id)?.label ?? 'supOther')).join(', ')}</dd>
              </div>
            ) : null}
          </dl>
          {kind === 'autocuidado' && preview.awarded < preview.raw ? (
            <p className="mt-3 text-base text-on-tertiary-fixed">{preview.awarded === 0 ? t('capZero') : t('capNote', { n: preview.awarded, points: t('pointsName') })}</p>
          ) : null}
          <div className={`${choiceOff} mt-4 block`}>
            <div>
              <p className="font-display text-base font-semibold">{t('privacyTitle')}</p>
              <p className="mt-1 text-sm leading-5 text-on-surface-variant">{t('privacyBody')}</p>
            </div>
          </div>
        </section>
      ) : null}

      {note ? <p className="text-base text-error">{note}</p> : null}

      <div className="sticky bottom-16 z-10 -mx-4 mt-2 border-t border-outline-variant bg-background/95 px-4 py-3 backdrop-blur">
        {state.step > 1 ? (
          <button type="button" className="mb-2 min-h-12 font-display text-base font-semibold text-primary" onClick={() => setState((current) => wizard(current, { type: 'back' }))}>
            {t('back')}
          </button>
        ) : null}
        {state.step === 2 ? (
          <button
            type="button"
            className={btnPrimary}
            disabled={!canContinue(state)}
            onClick={() => setState((current) => wizard(current, { type: 'next' }))}
          >
            {t('continue')}
          </button>
        ) : null}
        {state.step === 3 ? (
          <>
            <button type="button" className={btnPrimary} data-testid="register-submit" disabled={!canSign(state) || busy} onClick={() => void sign()}>
              {t('signCta', { n: preview.awarded, points: t('pointsName') })}
            </button>
            <p className="mt-2 text-center text-sm text-on-surface-variant">{t('trust')}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}

function Stepper({
  label,
  value,
  lessLabel,
  moreLabel,
  testid,
  onLess,
  onMore,
}: {
  label: string
  value: number
  lessLabel: string
  moreLabel: string
  testid: string
  onLess: () => void
  onMore: () => void
}) {
  return (
    <div>
      <p id={`${testid}-label`} className="mb-1 font-display text-sm font-semibold text-on-surface">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-1" role="group" aria-labelledby={`${testid}-label`}>
        <button type="button" className="press size-12 rounded-lg bg-surface-container text-xl" aria-label={lessLabel} onClick={onLess}>
          −
        </button>
        <span className="font-display text-xl font-bold" data-testid={testid}>
          {value}
        </span>
        <button type="button" className="press size-12 rounded-lg bg-primary text-xl text-on-primary" aria-label={moreLabel} onClick={onMore}>
          +
        </button>
      </div>
    </div>
  )
}
