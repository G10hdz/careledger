import type { CSSProperties } from 'react'
import {
  CLINICAL_SAVINGS_PER_HOUR_USD,
  POINT_VALUE_MXN,
  POINTS_PER_HOUR,
} from '@careledger/domain'
import {
  HOURS_DEFAULT,
  HOURS_MAX,
  HOURS_MIN,
  HOURS_STEP,
  LEVELS,
  RELEVO_COST_POINTS,
  RELEVO_HOURS,
  estimateWeek,
  formatHours,
  formatHoursText,
  formatInteger,
  formatMxn,
  formatUsd,
} from '@/lib/estimate'
import { Icon } from './icon'

interface CalcState {
  h: number
  hl: string
  ht: string
  p: string
  m: string
  u: string
  r: string
  f: number
  a: string
}

const LIVE_TEMPLATE =
  'Estimación: {hours} por semana, {points} Puntos Cívicos, {mxn} de valor de canje, {usd} de ahorro social y {rest} de relevo certificado.'

function buildState(hours: number): CalcState {
  const estimate = estimateWeek(hours)
  const hoursText = formatHoursText(estimate.hours)

  return {
    h: estimate.hours,
    hl: `${formatHours(estimate.hours)} h`,
    ht: hoursText,
    p: formatInteger(estimate.points),
    m: formatMxn(estimate.valueMxn),
    u: formatUsd(estimate.savingsUsd),
    r: `${estimate.restHours.toFixed(1)} h`,
    f: Math.round(((estimate.hours - HOURS_MIN) / (HOURS_MAX - HOURS_MIN)) * 1000) / 10,
    a: `${hoursText} por semana`,
  }
}

function liveText(state: CalcState): string {
  return LIVE_TEMPLATE.replace('{hours}', state.ht)
    .replace('{points}', state.p)
    .replace('{mxn}', state.m)
    .replace('{usd}', state.u)
    .replace('{rest}', state.r)
}

const INITIAL = buildState(HOURS_DEFAULT)

const PAYLOAD_JSON = JSON.stringify({
  constants: {
    pph: POINTS_PER_HOUR,
    ppmxn: POINT_VALUE_MXN,
    clinical: CLINICAL_SAVINGS_PER_HOUR_USD,
    relevoCost: RELEVO_COST_POINTS,
    relevoHours: RELEVO_HOURS,
    min: HOURS_MIN,
    max: HOURS_MAX,
    initial: HOURS_DEFAULT,
  },
  template: LIVE_TEMPLATE,
}).replace(/</g, '\\u003c')

const LOADER_SCRIPT = `
(function () {
  var root = document.getElementById('calc-root');
  if (!root) return;

  var loading = false;

  function load() {
    if (loading || root.getAttribute('data-calc-ready') === 'true') return;
    loading = true;
    var script = document.createElement('script');
    script.src = '/calc.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function queue(value) {
    if (root.getAttribute('data-calc-ready') === 'true') return;
    if (value) root.setAttribute('data-pending-hours', value);
    load();
  }

  root.addEventListener('pointerover', load, { passive: true });
  root.addEventListener('focusin', load);
  root.addEventListener('touchstart', load, { passive: true });

  root.addEventListener('input', function (event) {
    if (event.target && event.target.hasAttribute('data-calc-slider')) {
      queue(event.target.value);
    }
  }, true);

  root.addEventListener('click', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('[data-calc-hours]') : null;
    if (button) queue(button.getAttribute('data-calc-hours'));
  }, true);
})();
`

export function Calculator() {
  return (
    <div
      id="calc-root"
      className="overflow-hidden rounded-[1.5rem] border border-outline-variant bg-white shadow-level-2"
    >
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-label-sm uppercase tracking-[0.14em] text-primary">
                Tu semana en números
              </p>
              <h3 className="mt-2 font-display text-headline-md font-semibold text-on-surface">
                Horas de cuidado por semana
              </h3>
            </div>
            <p
              data-calc-hours-label
              className="shrink-0 font-display text-headline-md font-bold tabular-nums text-primary"
            >
              {INITIAL.hl}
            </p>
          </div>

          <div className="mt-6">
            <label htmlFor="calc-hours" className="sr-only">
              Horas de cuidado por semana
            </label>
            <input
              id="calc-hours"
              data-calc-slider
              type="range"
              min={HOURS_MIN}
              max={HOURS_MAX}
              step={HOURS_STEP}
              defaultValue={HOURS_DEFAULT}
              className="range-civic"
              style={{ '--fill': `${INITIAL.f}%` } as CSSProperties}
              aria-valuetext={INITIAL.a}
              aria-describedby="calc-help"
            />
            <div className="mt-1 flex justify-between font-display text-label-sm text-on-surface-variant">
              <span>{HOURS_MIN} h</span>
              <span>{HOURS_MAX} h</span>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="font-display text-label-sm font-semibold text-on-surface-variant">
              Niveles de referencia
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {LEVELS.map((level) => {
                const pressed = level.hours === HOURS_DEFAULT
                return (
                  <button
                    key={level.id}
                    data-calc-hours={level.hours}
                    type="button"
                    aria-pressed={pressed}
                    className={`min-h-12 rounded-full border px-3.5 font-display text-label-sm transition-colors ${
                      pressed
                        ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                        : 'border-outline-variant bg-white text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {level.name} · {formatHours(level.hours)} h
                  </button>
                )
              })}
            </div>
          </fieldset>

          <p
            id="calc-help"
            className="mt-6 flex gap-2.5 border-t border-outline-variant pt-4 text-body-sm leading-relaxed text-on-surface-variant"
          >
            <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            El cálculo base es de 10 Puntos Cívicos por hora. La bitácora de dificultad puede subir
            la emisión hasta 1.6x.
          </p>
        </div>

        <div className="bg-on-primary-fixed p-5 text-inverse-on-surface sm:p-8">
          <p className="font-display text-label-sm uppercase tracking-[0.14em] text-primary-fixed-dim">
            Estimación semanal
          </p>

          <p
            data-calc-points
            className="mt-3 font-display text-[3.5rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-primary-fixed"
          >
            {INITIAL.p}
          </p>
          <p className="mt-1 font-display text-label-lg text-inverse-on-surface">
            Puntos Cívicos
          </p>
          <p data-calc-caption className="mt-2 text-body-sm text-inverse-on-surface/70">
            Cuidado certificado: {INITIAL.ht}.
          </p>

          <dl className="mt-6 divide-y divide-primary-fixed-dim/20 border-t border-primary-fixed-dim/20">
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-body-sm text-inverse-on-surface/75">Valor de canje</dt>
              <dd
                data-calc-mxn
                className="font-display text-label-lg font-semibold tabular-nums text-inverse-on-surface"
              >
                {INITIAL.m}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-body-sm text-inverse-on-surface/75">
                Ahorro social
                <span className="mt-0.5 block text-label-sm text-inverse-on-surface/55">
                  al sistema de salud
                </span>
              </dt>
              <dd
                data-calc-usd
                className="font-display text-label-lg font-semibold tabular-nums text-inverse-on-surface"
              >
                {INITIAL.u}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-body-sm text-inverse-on-surface/75">
                Descanso ganado
                <span className="mt-0.5 block text-label-sm text-inverse-on-surface/55">
                  relevo certificado
                </span>
              </dt>
              <dd
                data-calc-rest
                className="font-display text-label-lg font-semibold tabular-nums text-inverse-on-surface"
              >
                {INITIAL.r}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-label-sm leading-relaxed text-inverse-on-surface/60">
            Los puntos se emiten al completarse las tres firmas. El ahorro social es una referencia
            del sistema de salud, no un ingreso en efectivo para la cuidadora.
          </p>
        </div>
      </div>

      <noscript>
        <style>{'[data-calc-slider],[data-calc-hours]{pointer-events:none;opacity:.6}'}</style>
        <p className="border-t border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
          La calculadora interactiva necesita JavaScript. La estimación para 7 horas ya está
          visible en esta tarjeta.
        </p>
      </noscript>

      <p data-calc-live className="sr-only" role="status" aria-live="polite">
        {liveText(INITIAL)}
      </p>

      <script
        id="calc-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: PAYLOAD_JSON }}
      />
      <script dangerouslySetInnerHTML={{ __html: LOADER_SCRIPT }} />
    </div>
  )
}
