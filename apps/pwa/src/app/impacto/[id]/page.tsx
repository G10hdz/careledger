'use client'

import { use } from 'react'
import { Receipt } from '@/components/RecordViews'

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <Receipt id={id} />
}
