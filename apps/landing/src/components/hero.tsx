import { CivicCard } from './civic-card'
import { Icon } from './icon'

const TRUST = [
  { icon: 'clock', text: 'Registro en 40 segundos' },
  { icon: 'wifi-off', text: 'Funciona sin internet' },
  { icon: 'user-check', text: 'Tres firmas del barrio' },
] as const

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-outline-variant/60">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-page relative grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
        <div className="max-w-[42rem]">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-mint-soft px-3.5 py-2 font-label-sm uppercase tracking-[0.12em] text-primary">
            <Icon name="spark" className="h-4 w-4" />
            Puntos Cívicos · Infraestructura del cuidado
          </p>

          <h1 className="mt-6 text-balance font-display text-display-lg-mobile font-bold tracking-[-0.02em] sm:text-display-lg">
            Cuidar es trabajo.{' '}
            <span className="mt-1 block text-primary">El sistema todavía no lo paga.</span>
          </h1>

          <p className="mt-6 max-w-[36rem] text-pretty text-body-md text-on-surface-variant sm:text-body-lg">
            Cuando cuidas, te descuidas convierte horas de cuidado no remunerado en{' '}
            <strong className="font-semibold text-on-surface">Puntos Cívicos</strong>: luz,
            transporte y relevo. No es caridad: es trabajo que merece pago.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#calculadora" className="btn btn-primary">
              Calcular mis Puntos Cívicos
              <Icon name="arrow-right" className="h-5 w-5" />
            </a>
            <a href="#ruta" className="btn btn-outline">
              Ver la ruta del tiempo
            </a>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {TRUST.map((item) => (
              <li key={item.text} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <span className="font-display text-label-sm text-on-surface-variant">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-label-sm text-on-surface-variant">
            Paridad fija: 1 Punto Cívico = $10 MXN. Vales con 30 días de vigencia.
          </p>
        </div>

        <CivicCard />
      </div>
    </section>
  )
}
