import { BENEFITS } from '@careledger/domain'
import { Icon, type IconName } from './icon'

const QR_GRID = 17

function buildQrPath(): string {
  const finderOrigins = [
    [0, 0],
    [QR_GRID - 7, 0],
    [0, QR_GRID - 7],
  ] as const

  const isFinder = (x: number, y: number): boolean | null => {
    for (const [ox, oy] of finderOrigins) {
      if (x < ox || x >= ox + 7 || y < oy || y >= oy + 7) continue
      const dx = x - ox
      const dy = y - oy
      const isBorder = dx === 0 || dx === 6 || dy === 0 || dy === 6
      const isCenter = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
      return isBorder || isCenter
    }
    return null
  }

  let path = ''
  for (let y = 0; y < QR_GRID; y += 1) {
    for (let x = 0; x < QR_GRID; x += 1) {
      const finder = isFinder(x, y)
      const on = finder ?? ((x * 7 + y * 11 + x * y * 3) % 7 < 3)
      if (on) path += `M${x} ${y}h1v1h-1z`
    }
  }
  return path
}

const QR_PATH = buildQrPath()

function costOf(id: string): number {
  const benefit = BENEFITS.find((item) => item.id === id)
  if (!benefit) throw new Error(`Beneficio no encontrado: ${id}`)
  return benefit.costPoints
}

const REDEMPTIONS: { id: string; label: string; icon: IconName; available: boolean }[] = [
  { id: 'metro-semanal', label: 'Pase semanal de Metro', icon: 'bus', available: true },
  { id: 'relevo-3h', label: '3 horas de relevo', icon: 'moon', available: false },
  { id: 'cfe-30', label: '30% en el recibo de luz', icon: 'lightbulb', available: false },
]

const BALANCE = 35

export function CivicCard() {
  return (
    <figure className="relative mx-auto w-full max-w-[24rem]">
      <div className="overflow-hidden rounded-[1.5rem] border-2 border-primary bg-white shadow-level-3">
        <div className="h-1.5 bg-primary" aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-outline-variant pb-4">
            <div>
              <p className="font-label-sm uppercase tracking-[0.14em] text-on-surface-variant">
                Cuenta cívica
              </p>
              <p className="mt-1 font-display text-headline-sm font-semibold">Carmen R.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-2.5 py-1 font-label-sm text-on-primary-fixed">
              <Icon name="check" className="h-3.5 w-3.5" />
              Validada
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
                Saldo disponible
              </p>
              <p className="mt-1 font-display text-[3rem] font-bold leading-none tracking-[-0.03em] tabular-nums">
                {BALANCE}
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant">Puntos Cívicos</p>
            </div>
            <div className="text-right">
              <p className="font-display text-label-lg text-on-surface">$350 MXN</p>
              <p className="text-body-sm text-on-surface-variant">paridad fija</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl bg-mint-soft p-3">
            <svg
              viewBox={`0 0 ${QR_GRID} ${QR_GRID}`}
              className="h-[4.5rem] w-[4.5rem] text-on-surface"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect width={QR_GRID} height={QR_GRID} fill="#ffffff" />
              <path d={QR_PATH} fill="currentColor" />
            </svg>
            <div>
              <p className="font-display text-label-md text-on-surface">Folio CV-2026-0042-MX</p>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                Canje sin banco, también con carnet impreso.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {REDEMPTIONS.map((item) => {
              const cost = costOf(item.id)
              const missing = cost - BALANCE
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
                    <Icon name={item.icon} className="h-[1.15rem] w-[1.15rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-label-md text-on-surface">
                      {item.label}
                    </span>
                    <span className="block text-label-sm text-on-surface-variant">
                      {item.available ? 'Disponible con ' : 'Faltan '}
                      {item.available ? cost : missing} pts
                    </span>
                  </span>
                  {item.available ? (
                    <Icon name="check" className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full border border-outline"
                      aria-hidden="true"
                    />
                  )}
                </li>
              )
            })}
          </ul>

          <p className="mt-5 border-t border-dashed border-outline-variant pt-3 text-label-sm leading-relaxed text-on-surface-variant">
            Jornada de 3.5 h · validada por 3 firmas del barrio · vale con 30 días de vigencia
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-label-sm text-on-surface-variant">
        Vista ilustrativa de una cuenta cívica.
      </figcaption>
    </figure>
  )
}
