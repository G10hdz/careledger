export const LANGS = ['es', 'nah', 'en'] as const

export type Lang = (typeof LANGS)[number]

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value)
}
