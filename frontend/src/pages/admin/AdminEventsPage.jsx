import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { eventsApi, mediaUrl } from '../../services/api'
import { formatDate } from '../../lib/utils'
import { useDebounce } from '../../hooks/useInfiniteScroll'

const statusLabel = {
  published: 'Publicado',
  draft: 'Borrador',
  hidden: 'Oculto',
}

export default function AdminEventsPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const debounced = useDebounce(search)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await eventsApi.adminList({
        page: 1,
        page_size: 100,
        search: debounced || undefined,
        status: status || undefined,
      })
      setItems(data.items)
    } catch {
      toast.error('Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [debounced, status])

  const remove = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return
    try {
      await eventsApi.remove(id)
      toast.success('Evento eliminado')
      load()
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  const duplicate = async (id) => {
    try {
      await eventsApi.duplicate(id)
      toast.success('Evento duplicado')
      load()
    } catch {
      toast.error('No se pudo duplicar')
    }
  }

  const togglePublish = async (event) => {
    try {
      if (event.status === 'published') {
        await eventsApi.hide(event.id)
        toast.success('Evento ocultado')
      } else {
        await eventsApi.publish(event.id)
        toast.success('Evento publicado')
      }
      load()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Eventos</h1>
          <p className="mt-1 text-sm text-muted">Crea, edita, publica y duplica.</p>
        </div>
        <Link
          to="/admin/eventos/nuevo"
          className="inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} /> Nuevo evento
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option value="">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
          <option value="hidden">Ocultos</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Evento</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No hay eventos.
                </td>
              </tr>
            )}
            {items.map((event) => (
              <tr key={event.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 shrink-0 overflow-hidden bg-surface">
                      {event.cover_image ? (
                        <img src={mediaUrl(event.cover_image)} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{event.title}</p>
                      <p className="text-xs text-muted">/{event.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(event.event_date) || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      event.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : event.status === 'hidden'
                          ? 'bg-zinc-100 text-zinc-600'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {statusLabel[event.status] || event.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/admin/eventos/${event.id}`}
                      className="rounded p-2 text-muted hover:bg-surface hover:text-ink"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => togglePublish(event)}
                      className="rounded p-2 text-muted hover:bg-surface hover:text-ink"
                      title={event.status === 'published' ? 'Ocultar' : 'Publicar'}
                    >
                      {event.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(event.id)}
                      className="rounded p-2 text-muted hover:bg-surface hover:text-ink"
                      title="Duplicar"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(event.id)}
                      className="rounded p-2 text-muted hover:bg-surface hover:text-brand"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
