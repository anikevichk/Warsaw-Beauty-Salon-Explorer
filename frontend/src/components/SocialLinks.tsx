import type { SalonDetails } from '../types'

export function SocialLinks({
  salon,
  wide = false
}: {
  salon: SalonDetails
  wide?: boolean
}) {
  const links = [
    {
      label: 'Booksy',
      url: salon.source_url,
      icon: '/icons/booksy.png'
    },
    {
      label: 'Instagram',
      url: salon.instagram,
      icon: '/icons/instagram.png'
    },
    {
      label: 'Facebook',
      url: salon.facebook,
      icon: '/icons/facebook.png'
    },
    {
      label: 'Website',
      url: salon.website,
      icon: '/icons/website.png'
    }
  ].filter((item) => item.url)

  if (links.length === 0) {
    return (
      <div className={`social-links ${wide ? 'wide' : ''}`}>
        <span>Social links</span>
        <p className="muted">No links provided</p>
      </div>
    )
  }

  return (
    <div className={`social-links ${wide ? 'wide' : ''}`}>
      <span>Social links</span>

      <div className="social-icons">
        {links.map((item) => (
          <a
            key={item.label}
            href={item.url ?? '#'}
            target="_blank"
            rel="noreferrer"
            title={item.label}
            aria-label={item.label}
          >
            <img src={item.icon} alt={item.label} />
          </a>
        ))}
      </div>
    </div>
  )
}