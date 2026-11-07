export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours <= 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

export function formatMxn(amount: number): string {
  const formatted = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(amount)
  return `$${formatted} MXN`
}

export function formatCode(code: string): string {
  return code.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function formatWhen(iso: string, lang: string): string {
  const locale = lang === 'en' ? 'en-MX' : 'es-MX'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
