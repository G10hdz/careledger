import { LogoMark } from './brand'
import { Icon } from './icon'

const NAV = [
  { href: '#ruta', label: 'La ruta' },
  { href: '#calculadora', label: 'Calculadora' },
  { href: '#garantias', label: 'Garantías' },
  { href: '#comercios', label: 'Comercios' },
  { href: '#faq', label: 'Preguntas' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-surface">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a
          href="#inicio"
          className="flex min-h-12 shrink-0 items-center gap-2.5"
          aria-label="Cuando cuidas, te descuidas, volver al inicio"
        >
          <LogoMark />
          <span className="font-display text-headline-sm font-bold tracking-[-0.02em]">
            Cuando cuidas, te descuidas
          </span>
        </a>

        <nav aria-label="Navegación principal" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3.5 font-display text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#calculadora" className="btn btn-primary min-h-12 px-4 text-label-md">
          Calcular puntos
          <Icon name="arrow-right" className="h-4 w-4" />
        </a>
      </div>
    </header>
  )
}
