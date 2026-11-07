import { SectionHeading } from './section-heading'
import { Icon } from './icon'

const FAQS = [
  {
    question: '¿Necesito tarjeta o cuenta de banco?',
    answer:
      'No. Puedes usar tu carnet impreso con QR, entregado en el nodo barrial. No hay comisiones ni requisitos bancarios para recibir o canjear puntos.',
  },
  {
    question: '¿Qué pasa si en mi casa no hay señal?',
    answer:
      'Todo se guarda en tu teléfono. La jornada se sincroniza cuando pasas cerca de un nodo o te conectas a una red, sin gastar tus datos móviles.',
  },
  {
    question: '¿Quién valida que la jornada existió?',
    answer:
      'La cuidadora, la persona cuidada y una veedora acreditada. Son tres firmas. El sistema audita una muestra del 5% de las jornadas y cruza patrones para detectar colusión.',
  },
  {
    question: '¿Los Puntos Cívicos pierden valor?',
    answer:
      'No. Son un vale municipal de contabilidad de doble entrada, con paridad fija de $10 MXN y respaldo en la partida presupuestaria del fondo. Cada vale dura 30 días naturales.',
  },
  {
    question: '¿Se guardan datos médicos?',
    answer:
      'No. Solo se certifica duración, categoría y tipos de apoyo. Nunca nombres de pacientes, diagnósticos ni fotos. La ubicación se usa como prueba de proximidad agregada, no como rastreo.',
  },
  {
    question: '¿Esto es una nómina o un empleo?',
    answer:
      'No. Es un reconocimiento cívico, no una relación laboral. Los Puntos Cívicos no sustituyen un salario ni crean antigüedad.',
  },
  {
    question: '¿Cómo entra mi alcaldía o mi comercio?',
    answer:
      'El piloto se está preparando en Coyoacán. Escríbenos desde la sección de contacto para revisar el modelo, el simulador y la afiliación de comercios.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="bg-surface">
      <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-24">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Lo que conviene saber antes de sumarte."
            lead="Sin letras chiquitas. Si falta algo, escríbenos y lo respondemos en el repositorio del proyecto."
          />
          <p className="mt-6 text-body-sm text-on-surface-variant">
            ¿Otra duda?{' '}
            <a
              href="#contacto"
              className="font-display font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              Escríbenos
            </a>
            .
          </p>
        </div>

        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {FAQS.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-4 font-display text-headline-sm font-semibold text-on-surface">
                <span className="text-pretty">{item.question}</span>
                <span
                  className="relative h-6 w-6 shrink-0 text-primary"
                  aria-hidden="true"
                >
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
                  <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-200 group-open:rotate-90" />
                </span>
              </summary>
              <div className="max-w-[42rem] pb-5 pr-8 text-pretty text-body-md leading-relaxed text-on-surface-variant">
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        <p className="flex items-center gap-2 text-label-sm text-on-surface-variant lg:col-span-2">
          <Icon name="shield" className="h-4 w-4 text-primary" />
          Privacidad, audiencia y respaldo presupuestario están definidos en las especificaciones
          públicas del proyecto.
        </p>
      </div>
    </section>
  )
}
