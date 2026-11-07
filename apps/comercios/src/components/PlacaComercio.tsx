import type { Comercio } from '@/lib/types'
import { clabeEnmascarada } from '@/lib/clabe'

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Distintivo "Comercio Solidario" REQ-COM-006: placa digital nivel 4. */
export function PlacaComercio({ comercio }: { comercio: Comercio }) {
  return (
    <div className="card-destacada" role="status" aria-label="Distintivo Comercio Solidario">
      <div className="flex flex-col items-center gap-md text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-primary-fixed text-2xl text-on-primary-fixed"
        >
          ✓
        </span>
        <div className="flex flex-col gap-xs">
          <span className="text-label-sm font-semibold uppercase tracking-wide text-primary">
            Comercio Solidario
          </span>
          <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
            {comercio.nombre}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Terminal de cobro activa · Liquidación SPEI sin comisión
          </p>
        </div>
        <dl className="grid w-full grid-cols-1 gap-sm text-left">
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-md py-sm">
            <dt className="text-label-sm text-on-surface-variant">Folio de placa</dt>
            <dd className="font-display text-label-md font-semibold text-on-surface">
              {comercio.placaFolio}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-md py-sm">
            <dt className="text-label-sm text-on-surface-variant">Afiliado desde</dt>
            <dd className="text-label-md font-semibold text-on-surface">
              {fechaCorta(comercio.afiliadoAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-md py-sm">
            <dt className="text-label-sm text-on-surface-variant">Cuenta de depósito</dt>
            <dd className="font-display text-label-md font-semibold text-on-surface">
              {clabeEnmascarada(comercio.clabe)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
