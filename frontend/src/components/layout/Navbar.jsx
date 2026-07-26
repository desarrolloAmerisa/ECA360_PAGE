import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandMark } from '../../context/SiteSettingsContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? 'text-brand' : 'text-muted hover:text-ink'}`
            }
          >
            Eventos
          </NavLink>
          <a href="/#buscar" className="text-sm font-medium text-muted transition hover:text-ink">
            Buscar
          </a>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                Eventos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
