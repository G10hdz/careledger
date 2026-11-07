import { LogoMark } from './brand'

const LINKS = [
  { href: '#ruta', label: 'La ruta' },
  { href: '#calculadora', label: 'Calculadora' },
  { href: '#garantias', label: 'Garantías' },
  { href: '#comercios', label: 'Comercios' },
  { href: '#faq', label: 'Preguntas' },
  { href: '/folleto-barrial.pdf', label: 'Folleto PDF' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-primary-fixed-dim/20 bg-on-primary-fixed text-inverse-on-surface">
      <div className="container-page py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <a href="#inicio" className="flex w-fit items-center gap-2.5">
              <LogoMark inverted />
              <span className="font-display text-headline-sm font-bold tracking-[-0.02em]">
                Cuando cuidas, te descuidas
              </span>
            </a>
            <p className="mt-3 max-w-[20rem] text-body-sm text-inverse-on-surface/65">
              Infraestructura cívica que reconoce el trabajo de cuidado no remunerado.
            </p>
          </div>

          <nav aria-label="Navegación del pie de página">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-6">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-6 items-center font-display text-label-sm text-inverse-on-surface/70 transition-colors hover:text-primary-fixed"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-primary-fixed-dim/20 pt-6 text-label-sm leading-relaxed text-inverse-on-surface/55 sm:flex-row sm:justify-between">
          <p>Piloto de diseño · Coyoacán, CDMX · 2026</p>
          <p className="max-w-[28rem]">
            Los Puntos Cívicos son vales de canje, no efectivo ni instrumento de inversión.
          </p>
        </div>
      </div>
    </footer>
  )
}
