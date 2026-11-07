import { LEVELS, estimateWeek, formatHours, formatInteger, formatMxn, formatUsd } from '@/lib/estimate'
import { Icon } from './icon'

export function Levels() {
  return (
    <div className="mt-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3
            id="niveles-title"
            className="text-balance font-display text-headline-md font-semibold text-on-surface"
          >
            Tres niveles, la misma regla: 10 puntos por hora.
          </h3>
          <p className="mt-2 max-w-[42rem] text-pretty text-body-md text-on-surface-variant">
            La jornada y la bitácora de dificultad cambian la emisión. La paridad no: cada Punto
            Cívico vale $10 MXN.
          </p>
        </div>
        <p className="shrink-0 font-display text-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
          Matriz de canje
        </p>
      </div>

      <ul aria-labelledby="niveles-title" className="mt-6 grid gap-4 md:grid-cols-3">
        {LEVELS.map((level) => {
          const estimate = estimateWeek(level.hours)
          return (
            <li
              key={level.id}
              className={`flex flex-col rounded-[1.25rem] border p-5 ${
                level.featured
                  ? 'border-2 border-primary bg-mint-soft'
                  : 'border-outline-variant bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-display text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
                  Nivel {level.name}
                </h4>
                {level.featured ? (
                  <span className="rounded-full bg-primary px-2.5 py-1 font-display text-label-sm text-on-primary">
                    Más frecuente
                  </span>
                ) : null}
              </div>

              <p className="mt-4 font-display text-headline-sm text-on-surface">
                {formatHours(level.hours)} h por semana
              </p>

              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-[2.75rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-primary">
                  {formatInteger(estimate.points)}
                </span>
                <span className="font-display text-label-md text-on-surface-variant">
                  Puntos Cívicos
                </span>
              </p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-display text-label-sm text-on-surface-variant">
                <span>{formatMxn(estimate.valueMxn)} de canje</span>
                <span aria-hidden="true">·</span>
                <span>{formatUsd(estimate.savingsUsd)} de ahorro preventivo</span>
              </div>

              <p className="mt-4 text-body-sm leading-relaxed text-on-surface-variant">
                {level.copy}
              </p>

              <p className="mt-auto flex items-start gap-2 border-t border-outline-variant/80 pt-4 text-body-sm text-on-surface">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {level.reach}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
