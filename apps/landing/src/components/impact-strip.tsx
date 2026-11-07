const STATS = [
  {
    value: '3.42x',
    label: 'Retorno social por peso invertido',
    detail: 'SROI con metodología Social Value International.',
  },
  {
    value: '−53%',
    label: 'Caídas reportadas',
    detail: 'En el piloto de diseño de Coyoacán.',
  },
  {
    value: '94%',
    label: 'Satisfacción de cuidadoras',
    detail: 'Encuesta de cierre del piloto.',
  },
]

export function ImpactStrip() {
  return (
    <section aria-labelledby="impacto-title" className="bg-on-primary-fixed text-inverse-on-surface">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.6fr] lg:items-start lg:gap-16">
          <div>
            <p className="flex items-center gap-3 font-label-sm uppercase tracking-[0.16em] text-primary-fixed-dim">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              Evaluación del piloto
            </p>
            <h2
              id="impacto-title"
              className="mt-4 text-balance font-display text-headline-lg-mobile font-bold tracking-[-0.01em] text-inverse-on-surface sm:text-headline-lg"
            >
              Tres cifras con método detrás.
            </h2>
          </div>

          <dl className="grid gap-8 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col border-t border-primary-fixed-dim/30 pt-5"
              >
                <dt className="order-2 mt-1 font-display text-label-sm uppercase tracking-[0.1em] text-inverse-on-surface/70">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-[2.75rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-primary-fixed">
                  {stat.value}
                </dd>
                <dd className="order-3 mt-2 text-body-sm text-inverse-on-surface/70">
                  {stat.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-8 max-w-[48rem] text-body-sm leading-relaxed text-inverse-on-surface/60">
          Cifras de la evaluación metodológica del piloto de diseño (Coyoacán / Santa Úrsula). Son
          evidencia de método, no una promesa de resultado en otras colonias.
        </p>
      </div>
    </section>
  )
}
