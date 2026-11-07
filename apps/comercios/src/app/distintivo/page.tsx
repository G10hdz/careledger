'use client'

import Link from 'next/link'
import { useComercioStore } from '@/components/StoreProvider'
import { PlacaComercio } from '@/components/PlacaComercio'

export default function DistintivoPage() {
  const { store } = useComercioStore()

  if (!store?.comercio) {
    return (
      <div className="flex flex-col gap-md">
        <header className="flex flex-col gap-xs">
          <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
            Mi placa Comercio Solidario
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Aún no tienes tu distintivo. Afíliate en menos de 5 minutos para activar tu
            terminal de cobro.
          </p>
        </header>
        <Link href="/afiliacion" className="btn-primario">
          Afiliarme ahora
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-lg">
      <header className="flex flex-col gap-xs">
        <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
          Mi distintivo
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Muéstralo en tu local: las cuidadoras saben que aquí se aceptan vales.
        </p>
      </header>

      <PlacaComercio comercio={store.comercio} />

      <div className="card flex flex-col gap-sm">
        <h2 className="font-display text-headline-sm font-semibold text-on-surface">
          Directorio de Cuidados de la Alcaldía
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Los comercios solidarios aparecen primero en el directorio que consultan las
          cuidadoras.
        </p>
        <dl className="mt-xs flex items-center justify-between rounded-lg bg-surface-container-low px-md py-md">
          <dt className="text-label-md text-on-surface-variant">Tu posición</dt>
          <dd className="font-display text-display-lg-mobile font-bold text-primary">
            #12
          </dd>
        </dl>
        <p className="text-body-sm text-on-surface-variant">
          Posición simulada de 87 comercios en el prototipo.
        </p>
      </div>
    </div>
  )
}
