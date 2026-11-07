export function LogoMark({
  inverted = false,
  className = 'h-9 w-9',
}: {
  inverted?: boolean
  className?: string
}) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl ${
        inverted ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-primary text-on-primary'
      } ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 8.4 8.1 14.2M12 8.4l3.9 5.8M9.3 16.2h5.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="12" cy="6" r="2.1" fill="currentColor" />
        <circle cx="7" cy="16" r="2.1" fill="currentColor" />
        <circle cx="17" cy="16" r="2.1" fill="currentColor" />
        <circle cx="12" cy="13" r="1.15" fill="var(--color-tertiary-fixed-dim)" />
      </svg>
    </span>
  )
}
