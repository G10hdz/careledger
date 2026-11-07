import { Icon } from './icon'

export function Contact() {
  return (
    <section id="contacto" className="bg-on-primary-fixed text-inverse-on-surface">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
          <div>
            <p className="flex items-center gap-3 font-label-sm uppercase tracking-[0.16em] text-primary-fixed-dim">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              Contacto
            </p>
            <h2 className="mt-4 max-w-[42rem] text-balance font-display text-headline-lg-mobile font-bold tracking-[-0.01em] text-inverse-on-surface sm:text-headline-lg">
              Lleva el piloto a tu colonia.
            </h2>
            <p className="mt-4 max-w-[36rem] text-pretty text-body-lg text-inverse-on-surface/75">
              Estamos preparando el piloto en Coyoacán. Si coordinas un nodo barrial, una alcaldía
              o un comercio local, escríbenos para revisar el modelo completo.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a className="btn btn-on-dark" href="/folleto-barrial.pdf" download>
              Descargar Folleto Barrial (PDF)
              <Icon name="download" className="h-5 w-5" />
            </a>
            <a
              className="btn btn-on-dark-outline"
              href="https://github.com/G10hdz/careledger/issues"
              target="_blank"
              rel="noreferrer"
            >
              Abrir un hilo en el repositorio
              <Icon name="external" className="h-4 w-4" />
              <span className="sr-only"> (abre en una pestaña nueva)</span>
            </a>
            <p className="text-label-sm leading-relaxed text-inverse-on-surface/60">
              El folleto resume la ruta, los niveles y las garantías en una hoja para imprimir.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
