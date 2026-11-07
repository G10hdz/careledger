'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useComercioStore } from '@/components/StoreProvider'
import { PlacaComercio } from '@/components/PlacaComercio'
import { clabeValida } from '@/lib/clabe'
import type { AfiliacionDatos } from '@/lib/afiliacion'

const ACEPTA_ARCHIVO = 'image/*,application/pdf'

export default function AfiliacionPage() {
  const { store, actions } = useComercioStore()
  const [clabe, setClabe] = useState('')
  const [idOficial, setIdOficial] = useState<{ name: string } | null>(null)
  const [domicilio, setDomicilio] = useState<{ name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  const clabeOk = useMemo(() => clabeValida(clabe), [clabe])

  if (enviado && store?.comercio) {
    return (
      <div className="flex flex-col gap-md">
        <div
          role="status"
          className="rounded-card bg-primary-fixed px-md py-md text-body-lg font-semibold text-on-primary-fixed"
        >
          ✓ ¡Listo! Ya eres Comercio Solidario.
        </div>
        <PlacaComercio comercio={store.comercio} />
        <p className="text-body-md text-on-surface-variant">
          Tu alta quedó registrada en menos de 5 minutos. Ahora puedes cobrar vales de
          Puntos Cívicos y liquidarlos por SPEI sin comisión.
        </p>
        <Link href="/distintivo" className="btn-primario">
          Ver mi placa y directorio
        </Link>
      </div>
    )
  }

  if (store && store.comercio) {
    return (
      <div className="flex flex-col gap-md">
        <div className="rounded-card bg-primary-fixed px-md py-sm text-body-md text-on-primary-fixed">
          Ya estás afiliado. Tu terminal de cobro está activa.
        </div>
        <PlacaComercio comercio={store.comercio} />
        <Link href="/distintivo" className="btn-secundario">
          Ver mi posición en el directorio
        </Link>
      </div>
    )
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!idOficial || !domicilio) {
      setError('Adjunta tu identificación oficial y tu comprobante de domicilio.')
      return
    }
    const datos: AfiliacionDatos = {
      clabe,
      idOficialName: idOficial.name,
      domicilioName: domicilio.name,
    }
    const resultado = actions.registrar(datos)
    if (resultado.ok) {
      setEnviado(true)
    } else if (resultado.reason === 'clabe_invalida') {
      setError('La CLABE no es válida. Revisa los 18 dígitos.')
    } else {
      setError('Faltan documentos. Adjunta ambos archivos e intenta de nuevo.')
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <header className="flex flex-col gap-xs">
        <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
          Afíliate en menos de 5 minutos
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Sin trámites ni notario. Solo 3 cosas: tu identificación, tu comprobante de
          domicilio y tu CLABE para depósitos.
        </p>
      </header>

      <form onSubmit={enviar} className="flex flex-col gap-lg" noValidate>
        <div className="card flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <label htmlFor="id-oficial" className="etiqueta">
              1. Identificación oficial
            </label>
            <label
              htmlFor="id-oficial"
              className="flex min-h-[52px] cursor-pointer items-center justify-between gap-sm rounded-lg border-[1.5px] border-dashed border-outline-variant bg-surface-container-lowest px-md py-sm"
            >
              <span className="text-body-md text-on-surface-variant">
                {idOficial ? idOficial.name : 'INE, pasaporte o cédula (foto)'}
              </span>
              <span
                className={`font-display text-label-lg font-semibold ${idOficial ? 'text-primary' : 'text-outline'}`}
                aria-hidden="true"
              >
                {idOficial ? '✓' : 'Subir'}
              </span>
              <input
                id="id-oficial"
                type="file"
                accept={ACEPTA_ARCHIVO}
                className="sr-only"
                onChange={(e) => setIdOficial(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="domicilio" className="etiqueta">
              2. Comprobante de domicilio comercial
            </label>
            <label
              htmlFor="domicilio"
              className="flex min-h-[52px] cursor-pointer items-center justify-between gap-sm rounded-lg border-[1.5px] border-dashed border-outline-variant bg-surface-container-lowest px-md py-sm"
            >
              <span className="text-body-md text-on-surface-variant">
                {domicilio ? domicilio.name : 'Recibo o contrato del local (foto)'}
              </span>
              <span
                className={`font-display text-label-lg font-semibold ${domicilio ? 'text-primary' : 'text-outline'}`}
                aria-hidden="true"
              >
                {domicilio ? '✓' : 'Subir'}
              </span>
              <input
                id="domicilio"
                type="file"
                accept={ACEPTA_ARCHIVO}
                className="sr-only"
                onChange={(e) => setDomicilio(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="clabe" className="etiqueta">
              3. CLABE de tu cuenta para depósito
            </label>
            <input
              id="clabe"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={18}
              value={clabe}
              onChange={(e) => setClabe(e.target.value.replace(/\D/g, ''))}
              placeholder="18 dígitos"
              aria-invalid={clabe.length > 0 && !clabeOk}
              className="campo font-display text-numeral-voucher tracking-wider"
            />
            {clabe.length > 0 &&
              (clabeOk ? (
                <p className="flex items-center gap-xs text-body-sm text-primary">
                  ✓ CLABE válida. Ahí depositaremos tus liquidaciones.
                </p>
              ) : (
                <p className="flex items-center gap-xs text-body-sm text-error">
                  ✗ CLABE inválida: deben ser 18 dígitos con dígito verificador.
                </p>
              ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-card bg-error-container px-md py-sm text-body-md text-on-error-container">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!clabeOk || !idOficial || !domicilio}
          className="btn-primario disabled:cursor-not-allowed disabled:opacity-50"
        >
          Activar mi Comercio Solidario
        </button>

        <p className="text-body-sm text-on-surface-variant">
          Privacidad: tus documentos no salen de tu dispositivo. Solo se guarda el nombre
          del archivo en este teléfono.
        </p>
      </form>
    </div>
  )
}
