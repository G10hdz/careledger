'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useComercioStore } from '@/components/StoreProvider'
import type { CobroRejectReason, CobroResult } from '@/lib/types'
import { benefitById } from '@/lib/catalogo'
import { decodificarQr, type QrDecodificado } from '@/lib/qr'
import { valesFixture, qrDeVale, ledgerLocal } from '@/lib/fixtures'
import { folioValido, normalizarFolio } from '@/lib/folio'

const MENSAJES: Record<CobroRejectReason, { titulo: string; detalle: string }> = {
  folio_invalido: {
    titulo: 'Folio inválido',
    detalle: 'El folio debe verse así: CV-AAAA-NNNN-MX. Revisa el vale.',
  },
  vale_no_encontrado: {
    titulo: 'Vale no encontrado',
    detalle: 'Revisa el folio o vuelve a pegar el código QR.',
  },
  firma_invalida: {
    titulo: 'Firma no válida',
    detalle: 'Este vale no pasa la verificación. Recházalo.',
  },
  vale_vencido: {
    titulo: 'Vale vencido',
    detalle: 'La vigencia terminó. No lo aceptes.',
  },
  vale_aun_no_vigente: {
    titulo: 'Todavía no es válido',
    detalle: 'El vale aún no entra en vigencia.',
  },
  vale_ya_usado_en_ledger: {
    titulo: 'Este vale ya se usó',
    detalle: 'Ya fue cobrado en otro comercio. Recházalo.',
  },
  ya_cobrado: {
    titulo: 'Ya cobraste este vale',
    detalle: 'Este folio ya está en tu historial. No lo cobres de nuevo.',
  },
  codigo_manual_invalido: {
    titulo: 'El código no coincide',
    detalle: 'El código manual no corresponde al folio del vale.',
  },
  beneficio_desconocido: {
    titulo: 'Beneficio no reconocido',
    detalle: 'Este vale no corresponde a un beneficio del catálogo.',
  },
}

function formatearPesos(mxn: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(mxn)
}

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function TerminalPage() {
  const { store, actions } = useComercioStore()
  const [folio, setFolio] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [qrTexto, setQrTexto] = useState('')
  const [ultimo, setUltimo] = useState<CobroResult | null>(null)
  const resultadoRef = useRef<HTMLDivElement>(null)

  // La confirmación siempre entra en pantalla: el tendero no puede pasarla por alto.
  useEffect(() => {
    if (ultimo) {
      resultadoRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [ultimo])

  const ledger = useMemo(() => ledgerLocal(valesFixture()), [])
  const vales = useMemo(() => valesFixture(), [])
  const pendientes = store?.cobros.filter((c) => !c.synced).length ?? 0

  if (!store?.comercio) {
    return (
      <div className="flex flex-col gap-md">
        <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
          Terminal de cobro
        </h1>
        <div className="card flex flex-col gap-sm">
          <p className="text-body-md text-on-surface-variant">
            Activa tu afiliación para empezar a cobrar vales. Son menos de 5 minutos.
          </p>
          <Link href="/afiliacion" className="btn-primario">
            Afiliarme ahora
          </Link>
        </div>
      </div>
    )
  }

  async function cobrarDesdeInput(input: {
    folio: string
    manualCode?: string
    voucher?: QrDecodificado['voucher']
    compacto?: QrDecodificado['compacto']
  }) {
    const folioLimpio = normalizarFolio(input.folio)
    if (!folioValido(folioLimpio)) {
      setUltimo({ ok: false, reason: 'folio_invalido', folio: input.folio })
      return
    }
    const voucher = input.voucher ?? ledger.get(folioLimpio)
    if (!voucher) {
      setUltimo({ ok: false, reason: 'vale_no_encontrado', folio: folioLimpio })
      return
    }
    setUltimo(
      await actions.cobrar({
        voucher,
        ...(input.compacto ? { compacto: input.compacto } : {}),
        ...(input.manualCode?.trim() ? { manualCode: input.manualCode.trim() } : {}),
      }),
    )
  }

  function procesar(e: React.FormEvent) {
    e.preventDefault()
    void cobrarDesdeInput({ folio, manualCode })
  }

  function procesarQr() {
    const decodificado = decodificarQr(qrTexto)
    if (!decodificado) {
      setUltimo({ ok: false, reason: 'folio_invalido', folio: qrTexto })
      return
    }
    setFolio(decodificado.folio)
    void cobrarDesdeInput({
      folio: decodificado.folio,
      ...(decodificado.manualCode ? { manualCode: decodificado.manualCode } : {}),
      ...(decodificado.voucher ? { voucher: decodificado.voucher } : {}),
      ...(decodificado.compacto ? { compacto: decodificado.compacto } : {}),
    })
  }

  function probarVale(index: number) {
    const vale = vales[index]!
    setQrTexto(qrDeVale(vale))
    void cobrarDesdeInput({ folio: vale.folio, voucher: vale })
  }

  return (
    <div className="flex flex-col gap-lg">
      <header className="flex flex-col gap-xs">
        <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
          Cobrar vale
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Paridad oficial: <strong className="text-on-surface">1 punto = $10 MXN</strong> ·
          funciona sin internet
        </p>
      </header>

      {pendientes > 0 && (
        <div className="flex items-center justify-between gap-sm rounded-card bg-secondary-fixed px-md py-sm">
          <span className="text-body-sm text-on-secondary-fixed-variant">
            {pendientes} cobro{pendientes === 1 ? '' : 's'} sin sincronizar. Se enviarán
            solos al reconectar.
          </span>
          <button
            type="button"
            onClick={actions.sincronizar}
            className="btn-secundario min-h-[44px] px-sm py-0 text-label-md"
          >
            Sincronizar
          </button>
        </div>
      )}

      <form onSubmit={procesar} className="card flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label htmlFor="folio" className="etiqueta">
            Folio del vale
          </label>
          <input
            id="folio"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            placeholder="CV-2026-0087-MX"
            aria-invalid={folio.length > 0 && !folioValido(folio)}
            className="campo font-display text-body-lg font-semibold tracking-wider"
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="manual-code" className="etiqueta">
            Código manual de respaldo (si no escaneaste QR)
          </label>
          <input
            id="manual-code"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
            placeholder="8 dígitos"
            className="campo font-display text-label-lg tracking-[0.2em]"
          />
        </div>
        <button type="submit" className="btn-primario" disabled={!folio.trim()}>
          Verificar y cobrar
        </button>
      </form>

      <details className="card">
        <summary className="cursor-pointer font-display text-label-lg font-semibold text-primary">
          Escanear QR (pegar código)
        </summary>
        <div className="mt-md flex flex-col gap-md">
          <textarea
            aria-label="Contenido del código QR"
            value={qrTexto}
            onChange={(e) => setQrTexto(e.target.value)}
            placeholder="Pega aquí el contenido del QR del vale"
            rows={3}
            className="campo font-body text-body-sm"
          />
          <button
            type="button"
            onClick={procesarQr}
            className="btn-secundario"
            disabled={!qrTexto.trim()}
          >
            Procesar código QR
          </button>
          <div className="flex flex-col gap-xs">
            <span className="text-label-sm text-on-surface-variant">
              Vales de muestra para probar la terminal:
            </span>
            <div className="flex flex-wrap gap-xs">
              <button type="button" onClick={() => probarVale(0)} className="chip">
                Despensa $100 (válido)
              </button>
              <button type="button" onClick={() => probarVale(1)} className="chip">
                Vencido
              </button>
              <button type="button" onClick={() => probarVale(2)} className="chip">
                Ya usado
              </button>
              <button type="button" onClick={() => probarVale(3)} className="chip">
                Firma alterada
              </button>
            </div>
          </div>
        </div>
      </details>

      <div ref={resultadoRef} className="flex flex-col">
        {ultimo?.ok ? (
          <section
            role="status"
            aria-label="Vale cobrado"
            className="card-destacada flex flex-col gap-md text-center"
          >
          <span className="mx-auto inline-flex items-center gap-xs rounded-full bg-primary-fixed px-md py-xs font-display text-label-md font-semibold text-on-primary-fixed">
            ✓ VALE USADO · NO LO COBRES DE NUEVO
          </span>
          <p className="font-display text-display-lg-mobile font-bold text-on-surface">
            {formatearPesos(ultimo.mxn)}
          </p>
          <div className="flex flex-col gap-xs">
            <p className="font-display text-headline-sm font-semibold text-on-surface">
              {benefitById(ultimo.cobro.benefitId)?.name ?? 'Beneficio'}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {ultimo.points} puntos · folio {ultimo.cobro.folio} · {horaCorta(ultimo.cobro.capturedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setUltimo(null)
              setFolio('')
              setManualCode('')
              setQrTexto('')
            }}
            className="btn-primario"
          >
            Cobrar otro vale
          </button>
        </section>
      ) : ultimo ? (
        <section
          role="alert"
          className="card flex flex-col gap-sm border-2 border-error"
        >
          <p className="font-display text-headline-sm font-bold text-error">
            ✗ {MENSAJES[ultimo.reason].titulo}
          </p>
          <p className="text-body-md text-on-surface-variant">
            {MENSAJES[ultimo.reason].detalle}
          </p>
          {ultimo.folio && (
            <p className="font-display text-label-md font-semibold text-on-surface">
              Folio: {ultimo.folio}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setUltimo(null)
              setFolio('')
              setManualCode('')
              setQrTexto('')
            }}
            className="btn-secundario"
          >
            Intentar con otro vale
          </button>
        </section>
        ) : null}
      </div>
    </div>
  )
}
