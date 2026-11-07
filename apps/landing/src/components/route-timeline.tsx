import { SectionHeading } from './section-heading'
import { Icon, type IconName } from './icon'

type Tone = 'primary' | 'secondary' | 'tertiary' | 'dark'

interface Phase {
  number: string
  label: string
  title: string
  body: string
  chips: string[]
  icon: IconName
  tone: Tone
}

const PHASES: Phase[] = [
  {
    number: '01',
    label: 'Hogar',
    title: 'Registras la jornada en 40 segundos.',
    body: 'Eliges a quién cuidaste, cuánto tiempo y qué tipo de apoyo diste. La app guarda todo en tu teléfono, sin señal y sin datos médicos.',
    chips: ['40 s', '100% sin internet', 'Firma local'],
    icon: 'home',
    tone: 'primary',
  },
  {
    number: '02',
    label: 'Comunidad',
    title: 'El barrio valida con un toque.',
    body: 'Tú, la persona cuidada y una vecina o promotora acreditada firman la jornada. Sin filas, sin sellos y sin exponer datos clínicos.',
    chips: ['3 de 3 firmas', 'Veedoras acreditadas', 'Auditoría del 5%'],
    icon: 'users',
    tone: 'secondary',
  },
  {
    number: '03',
    label: 'Salud pública',
    title: 'El ahorro se vuelve medible.',
    body: 'Una jornada de 3.5 horas evita alrededor de $120 USD en urgencias, según la evaluación metodológica del piloto. Ese cálculo sostiene el fondo que respalda cada punto.',
    chips: ['$120 USD / 3.5 h', 'SROI 3.42x', 'Metodología auditable'],
    icon: 'heart',
    tone: 'tertiary',
  },
  {
    number: '04',
    label: 'Recompensa',
    title: 'Eliges tu beneficio.',
    body: 'Luz, transporte, tres horas de relevo o apoyo en comercios del barrio. Cada vale dura 30 días y se puede usar con teléfono o carnet impreso.',
    chips: ['1 Punto = $10 MXN', 'Canje sin banco', 'Comercios locales'],
    icon: 'spark',
    tone: 'dark',
  },
]

const BADGE_TONE: Record<Tone, string> = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  tertiary: 'bg-tertiary text-on-tertiary',
  dark: 'bg-inverse-surface text-inverse-on-surface',
}

export function RouteTimeline() {
  return (
    <section id="ruta" className="border-b border-outline-variant/60 bg-white">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="La ruta del tiempo"
            title="Cuatro pasos entre cuidar y recibir."
            lead="Cada jornada sigue el mismo camino. La cuidadora no persigue oficinas: el sistema se mueve alrededor de su vida."
          />
          <p className="flex shrink-0 items-center gap-2 font-display text-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
            <Icon name="route" className="h-4 w-4 text-primary" />
            Hogar a recompensa
          </p>
        </div>

        <div className="relative mt-12">
          <div
            className="absolute bottom-2 left-7 top-2 w-px bg-outline-variant md:hidden"
            aria-hidden="true"
          />
          <div
            className="absolute left-7 right-7 top-7 hidden h-px bg-outline-variant lg:block"
            aria-hidden="true"
          />

          <ol className="grid gap-10 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4 lg:gap-0">
            {PHASES.map((phase) => (
              <li key={phase.number} className="relative pl-20 md:pl-0 lg:pr-7">
                <span
                  className={`absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-2xl md:relative md:mb-6 ${BADGE_TONE[phase.tone]}`}
                >
                  <Icon name={phase.icon} className="h-6 w-6" />
                </span>

                <p className="font-display text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
                  <span className="text-primary">{phase.number}</span>
                  <span aria-hidden="true"> · </span>
                  {phase.label}
                </p>
                <h3 className="mt-2 text-balance font-display text-headline-sm font-semibold text-on-surface">
                  {phase.title}
                </h3>
                <p className="mt-3 text-pretty text-body-md text-on-surface-variant">{phase.body}</p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {phase.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-display text-label-sm text-on-surface-variant"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
