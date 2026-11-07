'use client'

import { use } from 'react'
import { VoucherCard } from '@/components/WalletViews'

export default function ValePage({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = use(params)
  return <VoucherCard folio={decodeURIComponent(folio)} />
}
