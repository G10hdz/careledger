import { POINT_VALUE_MXN } from '@careledger/domain'
import { SectionHeading } from './section-heading'
import { Icon, type IconName } from './icon'

const STEPS: { icon: IconName; title: string; copy: string }[] = [
  {
    icon: 'pen',
    title: 'Afiliación en 5 minutos',
    copy: 'Identificación oficial, comprobante de domicilio y CLABE. Sin terminal bancaria ni costo de alta.',
  },
  {
    icon: 'qr',
    title: 'Cobro con QR o folio',
    copy: 'El cliente paga con su teléfono o carnet impreso, incluso cuando no hay señal en el local.',
  },
  {
    icon: 'bank',
    title: 'Liquidación SPEI en 24 h',
    copy: 'Transferencia por el total de la venta. 0% de comisión por transacción.',
  },
]

const EXAMPLE_POINTS = 35

export function Merchants() {
  return (
    <section id="comercios" className="border-y border-outline-variant/60 bg-white">
      <div className="container-page py-16 sm:py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Comercios aliados"
              title="Tu comercio cobra en 24 horas. Sin comisión."
              lead="Panaderías, farmacias, fruterías y cooperativas reciben Puntos Cívicos como un vale de $10 MXN por punto. El fondo municipal te liquida por SPEI al día siguiente."
            />

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 font-display text-label-md text-on-primary">
                <Icon name="check" className="h-4 w-4" />
                0% de comisión
              </span>
              <span className="rounded-full border border-outline-variant bg-surface-container-low px-3.5 py-2 font-display text-label-sm text-on-surface-variant">
                Paridad fija: 1 Punto = ${POINT_VALUE_MXN} MXN
              </span>
            </div>

            <a href="#contacto" className="btn btn-primary mt-7 w-full sm:w-auto">
              Quiero afiliar mi comercio
              <Icon name="arrow-right" className="h-5 w-5" />
            </a>

            <ol className="mt-10 space-y-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint-soft text-primary">
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
                      0{index + 1}
                    </p>
                    <h3 className="mt-0.5 font-display text-headline-sm font-semibold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="mt-1 max-w-[32rem] text-body-sm leading-relaxed text-on-surface-variant">
                      {step.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <figure className="mx-auto w-full max-w-[28rem]">
            <div className="rounded-[1.5rem] border border-outline-variant bg-surface p-5 shadow-level-2 sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <p className="font-display text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
                    Liquidación SPEI
                  </p>
                  <p className="mt-1 font-display text-headline-sm font-semibold text-on-surface">
                    Comercio del barrio
                  </p>
                </div>
                <span className="rounded-full bg-surface-container-high px-2.5 py-1 font-display text-label-sm text-on-surface-variant">
                  Ejemplo
                </span>
              </div>

              <dl className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body-sm text-on-surface-variant">Venta con Puntos Cívicos</dt>
                  <dd className="font-display text-label-md text-on-surface">
                    {EXAMPLE_POINTS} pts
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body-sm text-on-surface-variant">Paridad</dt>
                  <dd className="font-display text-label-md text-on-surface">
                    ${POINT_VALUE_MXN} MXN por punto
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-outline-variant pt-3">
                  <dt className="font-display text-label-md text-on-surface">Total de la venta</dt>
                  <dd className="font-display text-headline-md font-bold tabular-nums text-on-surface">
                    ${EXAMPLE_POINTS * POINT_VALUE_MXN} MXN
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body-sm text-on-surface-variant">Comisión</dt>
                  <dd className="font-display text-label-md font-semibold text-primary">$0 MXN</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body-sm text-on-surface-variant">Depósito</dt>
                  <dd className="font-display text-label-md text-on-surface">24 h</dd>
                </div>
              </dl>

              <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-primary-fixed/40 p-3 text-label-sm leading-relaxed text-on-primary-fixed">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" />
                Reembolso íntegro del fondo municipal. Sin terminal bancaria, sin cuota mensual.
              </p>
            </div>
            <figcaption className="mt-3 text-center text-label-sm text-on-surface-variant">
              Comprobante ilustrativo de una venta de 35 Puntos Cívicos.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
