'use client'

import { BENEFITS } from '@careledger/domain'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CareError } from '@/lib/app'
import { voucherPdf, voucherQrText } from '@/lib/documents'
import { downloadBlob, downloadBytes } from '@/lib/download'
import { formatCode, formatMxn, formatWhen } from '@/lib/format'
import { careApp } from '@/lib/singleton'
import { useCare } from './Provider'
import { btnPrimary, btnSecondary, card } from './styles'

export function WalletHome() {
  const { snap, t, refresh } = useCare()
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  if (!snap) return null

  async function redeem(id: string) {
    setBusy(id)
    setNote(null)
    try {
      const voucher = await careApp().redeem(id)
      await refresh()
      window.location.assign(`/billetera/${voucher.folio}`)
    } catch (error) {
      setNote(error instanceof CareError && error.code === 'saldo' ? t('saldo') : t('saveError'))
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[1.625rem] font-bold leading-8">{t('walletTitle')}</h1>
      <section className="rounded-2xl bg-primary px-4 py-5 text-on-primary">
        <p className="font-display text-sm font-semibold">{t('balanceLabel')}</p>
        <p className="mt-1 font-display text-4xl font-bold" data-testid="wallet-balance">
          {snap.wallet.points}
        </p>
        <p className="text-base">{t('pointsName')}</p>
        <p className="mt-3 text-base">
          {t('equivalent')}: {formatMxn(snap.wallet.mxn)}
        </p>
        <p className="mt-1 text-sm">
          {t('monthPoints')}: {snap.wallet.monthPoints} · {t('hoursRecognized')}: {snap.wallet.hours} h
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">{t('catalogTitle')}</h2>
        <p className="mt-1 text-base text-on-surface-variant">{t('catalogBody')}</p>
        <ul className="mt-3 flex flex-col gap-3">
          {BENEFITS.map((benefit) => {
            const short = snap.wallet.points < benefit.costPoints
            return (
              <li key={benefit.id} className={card} data-testid={`benefit-${benefit.id}`}>
                <p className="font-display text-sm font-semibold text-secondary">{benefit.tag}</p>
                <h3 className="mt-1 font-display text-lg font-semibold leading-6">{benefit.name}</h3>
                <p className="mt-2 text-sm leading-5 text-on-surface-variant">{benefit.description}</p>
                <p className="mt-3 font-display text-base font-bold">
                  {benefit.costPoints} {t('pointsName')}
                </p>
                <button
                  type="button"
                  className={`${btnPrimary} mt-3`}
                  disabled={short || busy === benefit.id}
                  onClick={() => void redeem(benefit.id)}
                >
                  {short ? t('missingPoints', { n: benefit.costPoints - snap.wallet.points, points: t('pointsName') }) : t('redeem')}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-sm leading-5 text-on-surface-variant" data-testid="guarantee">
          {t('guarantee')}
        </p>
      </section>

      {note ? <p className="text-base text-error">{note}</p> : null}

      <section>
        <h2 className="font-display text-xl font-semibold">{t('history')}</h2>
        {snap.vouchers.length === 0 ? <p className="mt-2 text-base text-on-surface-variant">{t('historyEmpty')}</p> : null}
        <ul className="mt-2 flex flex-col gap-2">
          {snap.vouchers.map((voucher) => (
            <li key={voucher.folio}>
              <Link href={`/billetera/${voucher.folio}`} className={`${card} block min-h-16`}>
                <span className="font-display font-semibold">{voucher.folio}</span>
                <span className="mt-1 block text-sm text-on-surface-variant">
                  {voucher.status === 'activo' ? t('voucherActive') : voucher.status === 'usado' ? t('voucherUsed') : t('voucherExpired')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function VoucherCard({ folio }: { folio: string }) {
  const { snap, t, lang } = useCare()
  const [qr, setQr] = useState<string | null>(null)
  const voucher = snap?.vouchers.find((item) => item.folio === folio)

  useEffect(() => {
    if (!voucher) return
    let alive = true
    void import('qrcode').then(async (mod) => {
      const url = await mod.toDataURL(voucherQrText(voucher), {
        width: 240,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#191c1e', light: '#ffffff' },
      })
      if (alive) setQr(url)
    })
    return () => {
      alive = false
    }
  }, [voucher])

  if (!snap) return null
  if (!voucher) return <p className="text-base">{t('historyEmpty')}</p>

  async function save() {
    if (!voucher || !qr) return
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1100
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 800, 1100)
    ctx.strokeStyle = '#00685f'
    ctx.lineWidth = 8
    ctx.strokeRect(24, 24, 752, 1052)
    ctx.fillStyle = '#191c1e'
    ctx.font = '700 40px sans-serif'
    ctx.fillText('CareLedger', 64, 110)
    ctx.font = '600 28px sans-serif'
    ctx.fillText(voucher.folio, 64, 180)
    const image = new Image()
    image.src = qr
    await image.decode()
    ctx.drawImage(image, 200, 240, 400, 400)
    ctx.font = '600 28px sans-serif'
    ctx.fillText(formatCode(voucher.manualCode), 64, 700)
    ctx.font = '400 24px sans-serif'
    const words = voucher.benefitName.split(' ')
    let line = ''
    let y = 760
    for (const word of words) {
      const next = line ? `${line} ${word}` : word
      if (next.length > 42) {
        ctx.fillText(line, 64, y)
        y += 32
        line = word
      } else line = next
    }
    if (line) ctx.fillText(line, 64, y)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((value) => resolve(value), 'image/png'))
    if (blob) downloadBlob(`${voucher.folio}.png`, blob)
  }

  return (
    <article className="flex flex-col gap-4" data-testid="voucher">
      <h1 className="font-display text-[1.625rem] font-bold leading-8">{voucher.benefitName}</h1>
      <section className="rounded-2xl border-2 border-primary bg-surface-container-lowest p-4">
        <p className="font-display text-sm font-semibold">{t('folio')}</p>
        <p className="font-display text-[1.75rem] font-bold leading-8 tracking-wide" data-testid="voucher-folio">
          {voucher.folio}
        </p>
        <div className="mt-4 flex justify-center">
          {qr ? (
            // El QR es la imagen del vale, el folio de al lado es el texto alternativo.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={voucher.folio} width={220} height={220} className="h-[220px] w-[220px]" data-testid="voucher-qr" />
          ) : (
            <div className="h-[220px] w-[220px] bg-surface-container" />
          )}
        </div>
        <p className="mt-4 font-display text-sm font-semibold">{t('manualCode')}</p>
        <p className="font-display text-2xl font-bold tracking-widest">{formatCode(voucher.manualCode)}</p>
      </section>
      <dl className={`${card} grid gap-2`}>
        <div>
          <dt className="font-display text-sm font-semibold">{t('validUntil')}</dt>
          <dd>{formatWhen(voucher.validUntil, lang)}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold">{t('issuer')}</dt>
          <dd>{snap.issuer}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold">{t('voucherStatus')}</dt>
          <dd>
            {voucher.status === 'activo' ? t('voucherActive') : voucher.status === 'usado' ? t('voucherUsed') : t('voucherExpired')}
          </dd>
        </div>
      </dl>
      <button type="button" className={btnPrimary} onClick={() => void save()}>
        {t('saveGallery')}
      </button>
      <button type="button" className={btnSecondary} onClick={() => downloadBytes(`vale-${voucher.folio}.pdf`, voucherPdf(voucher, snap.issuer), 'application/pdf')}>
        {t('downloadPdf')}
      </button>
      <button type="button" className="min-h-12 font-display text-base font-semibold text-secondary" onClick={() => window.print()}>
        {t('printVoucher')}
      </button>
    </article>
  )
}
