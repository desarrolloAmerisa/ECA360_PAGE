import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Eye, FileEdit, MessageSquare, Image } from 'lucide-react'
import { eventsApi } from '../../services/api'

const cards = [
  { key: 'total_events', label: 'Eventos', icon: CalendarDays, color: 'text-brand' },
  { key: 'published_events', label: 'Publicados', icon: Eye, color: 'text-emerald-600' },
  { key: 'draft_events', label: 'Borradores', icon: FileEdit, color: 'text-amber-600' },
  { key: 'total_comments', label: 'Comentarios', icon: MessageSquare, color: 'text-sky-600' },
  { key: 'total_media', label: 'Archivos media', icon: Image, color: 'text-violet-600' },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    eventsApi.stats().then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Resumen del CMS de eventos.</p>
        </div>
        <Link
          to="/admin/eventos/nuevo"
          className="bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Nuevo evento
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{label}</p>
              <Icon size={18} className={color} />
            </div>
            <p className="mt-3 font-display text-4xl font-semibold">
              {stats ? stats[key] : '—'}
            </p>
          </div>
        ))}
      </div>

      {stats?.pending_comments > 0 && (
        <div className="mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Hay {stats.pending_comments} comentario(s) desactivados.{' '}
          <Link to="/admin/comentarios" className="font-semibold underline">
            Revisar
          </Link>
        </div>
      )}
    </div>
  )
}
