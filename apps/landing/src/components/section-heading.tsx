export function SectionHeading({
  eyebrow,
  title,
  lead,
  dark = false,
  className = '',
}: {
  eyebrow: string
  title: string
  lead?: string
  dark?: boolean
  className?: string
}) {
  return (
    <header className={className}>
      <p
        className={`flex items-center gap-3 font-label-sm uppercase tracking-[0.16em] ${
          dark ? 'text-primary-fixed-dim' : 'text-primary'
        }`}
      >
        <span className="h-px w-8 bg-current" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 max-w-[48rem] text-balance font-display text-headline-lg-mobile font-bold tracking-[-0.01em] sm:text-headline-lg ${
          dark ? 'text-inverse-on-surface' : 'text-on-surface'
        }`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`mt-4 max-w-[42rem] text-pretty text-body-lg ${
            dark ? 'text-inverse-on-surface/80' : 'text-on-surface-variant'
          }`}
        >
          {lead}
        </p>
      ) : null}
    </header>
  )
}
