import { SectionHeading } from './section-heading'
import { Icon, type IconName } from './icon'

const GUARANTEES: {
  icon: IconName
  title: string
  copy: string
  tag: string
}[] = [
  {
    icon: 'heart',
    title: 'Cuidar no es favor, es trabajo.',
    copy: 'El trabajo doméstico y de cuidados sostiene una parte enorme de la economía y casi nunca aparece en una nómina. Los Puntos Cívicos lo reconocen con una contraprestación tangible, no con un agradecimiento simbólico.',
    tag: 'Reconocimiento, no caridad',
  },
  {
    icon: 'shield',
    title: 'Tu privacidad es sagrada.',
    copy: 'Nunca se suben nombres de pacientes, diagnósticos ni fotos. La atestación transporta duración, categoría y tipos de apoyo. La ubicación se usa como prueba de proximidad agregada, no como rastreo continuo.',
    tag: 'Privacidad por diseño',
  },
  {
    icon: 'building',
    title: 'Respaldo municipal real.',
    copy: 'Cada punto emitido tiene una partida presupuestaria detrás. El vale no depende de donativos ni de patrocinios: el fondo municipal garantiza la suficiencia por vale y liquida a los comercios.',
    tag: 'Suficiencia por vale',
  },
]

export function Guarantees() {
  return (
    <section id="garantias" className="border-y border-outline-variant/60 bg-mint-soft">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Marco ético"
          title="Tres garantías innegociables."
          lead="CareLedger no es asistencia arbitraria ni una campaña de buena voluntad. Es infraestructura cívica con reglas escritas."
        />

        <ul className="mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
          {GUARANTEES.map((item, index) => (
            <li
              key={item.title}
              className={`relative border-t border-primary/20 pt-6 md:border-t-0 md:px-8 md:pt-0 ${
                index === 0 ? 'md:pl-0' : 'md:border-l'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <span className="font-display text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-4 text-balance font-display text-headline-sm font-semibold text-on-surface">
                {item.title}
              </h3>
              <p className="mt-3 text-pretty text-body-md leading-relaxed text-on-surface-variant">
                {item.copy}
              </p>
              <p className="mt-4 inline-flex rounded-full border border-primary/25 bg-white px-3 py-1 font-display text-label-sm text-primary">
                {item.tag}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
