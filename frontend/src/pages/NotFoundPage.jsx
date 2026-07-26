import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'

export default function NotFoundPage() {
  useSeo({ title: '404 — Página no encontrada | ECA360' })

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Error 404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold">Página no encontrada</h1>
      <p className="mt-4 text-muted">La ruta que buscas no existe o el evento fue ocultado.</p>
      <Link
        to="/"
        className="mt-8 bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
