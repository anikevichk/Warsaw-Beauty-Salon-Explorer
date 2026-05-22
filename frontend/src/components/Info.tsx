export function Info({
  label,
  value,
  isLink = false,
  wide = false
}: {
  label: string
  value: string | null | undefined
  isLink?: boolean
  wide?: boolean
}) {
  return (
    <div className={`info-block ${wide ? 'wide' : ''}`}>
      <span>{label}</span>

      {value ? (
        isLink ? (
          <a href={value} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          <p>{value}</p>
        )
      ) : (
        <p className="muted">Not provided</p>
      )}
    </div>
  )
}