import { SectionHeading } from './section-heading'
import { Icon } from './icon'

const AUDIENCES = [
  {
    number: '01',
    label: 'Cuidadoras y cuidadores',
    title: 'Si cuidas a alguien',
    body: 'Registra la jornada desde el teléfono, sin señal y a una mano. También ganas puntos por dormir, hidratarte o pedir apoyo.',
    bullets: ['Registro en 40 s', 'Offline-first', 'Puntos por autocuidado'],
    href: '#calculadora',
    cta: 'Calcular mi semana',
    style: 'btn-primary',
  },
  {
    number: '02',
    label: 'Familias y comercios',
    title: 'Si tu familia recibe cuidado',
    body: 'Fondea la cuenta de quien cuida, envía propinas o acepta Puntos Cívicos en tu negocio. El reembolso llega íntegro.',
    bullets: ['Propinas sin fricción', 'Cobro con QR', 'Liquidación SPEI 24 h'],
    href: '#comercios',
    cta: 'Afiliar mi comercio',
    style: 'btn-secondary',
  },
  {
    number: '03',
    label: 'Gobiernos y funcionarios',
    title: 'Si diseñas política pública',
    body: 'Mide el retorno social con metodología auditable, simula el costo actuarial y revisa cada vale por folio.',
    bullets: ['SROI auditable', 'Libro mayor por folio', 'Suficiencia por vale'],
    href: '#contacto',
    cta: 'Hablar del piloto',
    style: 'btn-outline',
  },
]

export function Audiences() {
  return (
    <section id="audiencias" className="bg-surface">
      <div className="container-page py-16 sm:py-20 lg:py-28">
        <SectionHeading
          eyebrow="Tres puertas de entrada"
          title="El sistema cambia según el lugar que ocupas."
          lead="La misma infraestructura, tres formas concretas de participar. Elige la tuya."
        />

        <ul className="mt-10 border-b border-outline-variant">
          {AUDIENCES.map((audience) => (
            <li
              key={audience.number}
              className="grid gap-5 border-t border-outline-variant py-8 lg:grid-cols-[0.7fr_1.3fr_auto] lg:items-center lg:gap-10 lg:py-9"
            >
              <div>
                <p className="font-display text-label-sm uppercase tracking-[0.14em] text-primary">
                  {audience.number}
                  <span aria-hidden="true"> · </span>
                  {audience.label}
                </p>
                <h3 className="mt-2 text-balance font-display text-headline-md font-semibold text-on-surface">
                  {audience.title}
                </h3>
              </div>

              <div>
                <p className="max-w-[36rem] text-pretty text-body-md text-on-surface-variant">
                  {audience.body}
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {audience.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-1.5 font-display text-label-sm text-on-surface-variant"
                    >
                      <Icon name="check" className="h-3.5 w-3.5 text-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={audience.href}
                className={`btn ${audience.style} w-full lg:w-auto`}
              >
                {audience.cta}
                <Icon name="arrow-right" className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
