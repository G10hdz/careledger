'use client'

import Link from 'next/link'
import { useCare } from '@/components/Provider'
import { btnPrimary, btnSecondary, card } from '@/components/styles'

export default function HomePage() {
  const { snap, t } = useCare()
  if (!snap) return null
  const status =
    snap.accreditation.status === 'acreditada' && snap.accreditation.id
      ? t('accredited', { id: snap.accreditation.id })
      : t('inProcess')

  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="font-display text-sm font-semibold text-primary">{t('worksOffline')}</p>
        <h1 className="mt-1 font-display text-[1.625rem] font-bold leading-8">{t('hello')}</h1>
        <p className="mt-2 text-base leading-6 text-on-surface-variant">{t('intro')}</p>
      </header>
      <Link href="/perfil" className={`${card} block min-h-16`} data-testid="home-accreditation">
        <span className="font-display text-sm font-semibold">{t('yourStatus')}</span>
        <span className="mt-1 block font-display text-lg font-bold">{status}</span>
      </Link>
      <section className={card}>
        <p className="font-display text-sm font-semibold">{t('nodeActive')}</p>
        <p className="mt-1 text-base">{snap.nodeName}</p>
        <p className="text-sm text-on-surface-variant">{t('worksOffline')}</p>
      </section>
      <div className="sticky bottom-16 z-10 -mx-4 mt-2 flex flex-col gap-2 border-t border-outline-variant bg-background/95 px-4 py-3 backdrop-blur">
        <Link href="/registrar" className={btnPrimary} data-testid="link-registrar">
          {t('registerCare')}
        </Link>
        <Link href="/autocuidado" className={btnSecondary} data-testid="link-autocuidado">
          {t('registerSelf')}
        </Link>
      </div>
    </div>
  )
}
