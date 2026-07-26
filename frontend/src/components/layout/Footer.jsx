import { Link } from 'react-router-dom'
import { BrandMark, useSiteSettings } from '../../context/SiteSettingsContext'

export default function Footer() {
  const { settings } = useSiteSettings()

  return (
    <footer className="mt-24 border-t border-line bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="[&_span]:text-white [&_.text-brand]:text-brand-light [&_.bg-brand]:bg-brand">
            <BrandMark nameClassName="text-white" />
          </div>
          <p className="mt-3 max-w-sm text-sm text-white/60">{settings.footer_text}</p>
        </div>
        <div className="flex gap-6 text-sm text-white/60">
          <Link to="/" className="hover:text-white">
            Eventos
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
