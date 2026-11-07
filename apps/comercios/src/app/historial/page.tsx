'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useComercioStore } from '@/components/StoreProvider'
import {
  cobrosDelDia,
  dateKey,
  liquidacionesConfirmadas,
  liquidacionesPendientes,
} from '@/lib/liquidacion'
import { foliosLiquidados } from '@/lib/liquidacion'
import { clabeEnmascarada } from '@/lib/clabe'

function pesos(mxn: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(mxn)
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function HistorialPage() {
  const { store, actions } = useComercioStore()
  const [mensaje, setMensaje] = useState<string | null>(null)

  const hoy = dateKey(new Date().toISOString())
  const cobrosHoy = useMemo(() => (store ? cobrosDelDia(store, hoy) : []), [store, hoy])
  const yaLiquidados = useMemo(() => (store ? foliosLiquidados(store) : new Set<string>()), [store])

  const totalDia = cobrosHoy.reduce((suma, c) => suma + c.mxn, 0)
  const pendientesHoy = cobrosHoy.filter((c) => !yaLiquidados.has(c.folio))
  const pendientes = store ? liquidacionesPendientes(store) : []
  const confirmadas = store ? liquidacionesConfirmadas(store) : []

  if (!store?.comercio) {
    return (
      <div className="flex flex-col gap-md">
        <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
          Historial y liquidación
        </h1>
        <div className="card flex flex-col gap-sm">
          <p className="text-body-md text-on-surface-variant">
            Activa tu afiliación para cobrar vales y liquidar por SPEI.
          </p>
          <Link href="/afiliacion" className="btn-primario">
            Afiliarme ahora
          </Link>
        </div>
      </div>
    )
  }

  function liquidarHoy() {
    const resultado = actions.liquidar()
    if (resultado.ok) {
      setMensaje(
        `Liquidación ${resultado.liquidacion.id} programada: ${pesos(resultado.liquidacion.amountMxn)} a tu CLABE ${clabeEnmascarada(resultado.liquidacion.clabe)}. Llega en ≤24h, 0% comisión.`,
      )
    } else if (resultado.reason === 'sin_cobros') {
      setMensaje('No hay cobros pendientes de liquidar hoy.')
    }
  }

  function confirmar(id: string) {
    if (actions.confirmarLiquidacion(id)) {
      setMensaje(`Liquidación ${id} confirmada por el banco. Dinero en camino.`)
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <header className="flex flex-col gap-xs">
        <h1 className="font-display text-headline-lg-mobile font-bold text-on-surface">
          Tu día
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Cobros, liquidaciones y tu dinero por SPEI.
        </p>
      </header>

      <section className="card flex flex-col gap-sm" aria-label="Total del día">
        <span className="text-label-md font-semibold text-on-surface-variant">
          Vendido hoy
        </span>
        <p className="font-display text-display-lg-mobile font-bold text-on-surface">
          {pesos(totalDia)}
        </p>
        <p className="text-body-sm text-on-surface-variant">
          {cobrosHoy.length} cobro{cobrosHoy.length === 1 ? '' : 's'} · 100% de tus ventas
          llega a tu cuenta, 0% comisión
        </p>
      </section>

      {mensaje && (
        <div role="status" className="rounded-card bg-primary-fixed px-md py-sm text-body-md text-on-primary-fixed">
          {mensaje}
        </div>
      )}

      <section className="flex flex-col gap-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-headline-sm font-semibold text-on-surface">
            Cobros de hoy
          </h2>
          <button
            type="button"
            onClick={liquidarHoy}
            disabled={pendientesHoy.length === 0}
            className="btn-primario min-h-[48px] px-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pendientesHoy.length === 0
              ? 'Todo liquidado'
              : `Liquidar ${pesos(pendientesHoy.reduce((s, c) => s + c.mxn, 0))}`}
          </button>
        </div>

        {cobrosHoy.length === 0 ? (
          <p className="rounded-card border border-dashed border-outline-variant px-md py-md text-body-md text-on-surface-variant">
            Aún no hay cobros hoy. Ve a Cobrar y escanea el primer vale.
          </p>
        ) : (
          <ul className="card flex flex-col divide-y divide-outline-variant">
            {cobrosHoy.map((cobro) => (
              <li
                key={cobro.folio}
                className="flex items-center justify-between gap-sm py-sm first:pt-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="font-display text-label-md font-semibold text-on-surface">
                    {cobro.folio}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    {hora(cobro.capturedAt)}
                    {!cobro.synced && ' · sin sincronizar'}
                    {yaLiquidados.has(cobro.folio) && ' · liquidado'}
                  </span>
                </div>
                <span className="font-display text-numeral-voucher font-bold text-on-surface">
                  {pesos(cobro.mxn)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="font-display text-headline-sm font-semibold text-on-surface">
          Liquidaciones SPEI
        </h2>

        {pendientes.length === 0 && confirmadas.length === 0 ? (
          <p className="rounded-card border border-dashed border-outline-variant px-md py-md text-body-md text-on-surface-variant">
            Sin liquidaciones. Al final del día toca “Liquidar” y el fondo municipal
            programa la transferencia.
          </p>
        ) : (
          <div className="flex flex-col gap-sm">
            {pendientes.map((liq) => (
              <div
                key={liq.id}
                className="card flex flex-col gap-sm border-[1.5px] border-tertiary"
              >
                <div className="flex items-center justify-between gap-sm">
                  <span className="font-display text-label-md font-semibold text-on-surface">
                    {liq.id}
                  </span>
                  <span className="rounded-full bg-tertiary-fixed px-sm py-xs text-label-sm font-semibold text-on-tertiary-fixed">
                    Programada ≤24h
                  </span>
                </div>
                <div className="flex items-end justify-between gap-sm">
                  <div className="flex flex-col">
                    <span className="text-body-sm text-on-surface-variant">
                      {liq.folios.length} vale{liq.folios.length === 1 ? '' : 's'} · 0%
                      comisión
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      CLABE {clabeEnmascarada(liq.clabe)}
                    </span>
                  </div>
                  <span className="font-display text-numeral-voucher font-bold text-on-surface">
                    {pesos(liq.amountMxn)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => confirmar(liq.id)}
                  className="btn-secundario min-h-[48px] px-md text-label-md"
                >
                  Confirmar transferencia (simulado)
                </button>
              </div>
            ))}
            {confirmadas.map((liq) => (
              <div key={liq.id} className="card flex items-center justify-between gap-sm">
                <div className="flex flex-col">
                  <span className="font-display text-label-md font-semibold text-on-surface">
                    {liq.id}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    Confirmada {liq.confirmedAt ? hora(liq.confirmedAt) : ''} · {liq.folios.length}{' '}
                    vale{liq.folios.length === 1 ? '' : 's'}
                  </span>
                </div>
                <span className="flex items-center gap-xs font-display text-numeral-voucher font-bold text-primary">
                  {pesos(liq.amountMxn)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
