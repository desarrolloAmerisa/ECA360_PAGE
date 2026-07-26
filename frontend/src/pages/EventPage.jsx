import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { eventsApi, mediaUrl } from '../services/api'
import { useSeo } from '../hooks/useSeo'
import { collectMediaFromBlocks, formatDate } from '../lib/utils'
import BlockRenderer from '../components/blocks/BlockRenderer'
import MediaCarousel from '../components/media/MediaCarousel'
import CommentsSection from '../components/comments/CommentsSection'
import EventCard from '../components/events/EventCard'

export default function EventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    Promise.all([eventsApi.getBySlug(slug), eventsApi.related(slug)])
      .then(([ev, rel]) => {
        if (cancelled) return
        setEvent(ev.data)
        setRelated(rel.data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useSeo({
    title: event ? `${event.seo_title || event.title} | ECA360` : 'Evento | ECA360',
    description: event?.seo_description || event?.excerpt,
    image: event?.og_image || event?.cover_image ? mediaUrl(event.og_image || event.cover_image) : undefined,
  })

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-6 h-14 w-3/4" />
        <div className="skeleton mt-8 aspect-video" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Evento no encontrado</h1>
        <Link to="/" className="mt-6 inline-flex text-brand hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const mediaItems = collectMediaFromBlocks(event.blocks)
  const hasHero = event.blocks?.some((b) => b.type === 'hero')

  return (
    <article>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand">
          <ArrowLeft size={16} /> Todos los eventos
        </Link>

        {!hasHero && (
          <header className="mt-8">
            {event.template && (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                {event.template.replace('_', ' ')}
              </p>
            )}
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              {event.title}
            </h1>
            {event.excerpt && <p className="mt-4 max-w-2xl text-lg text-muted">{event.excerpt}</p>}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
              {event.event_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={15} /> {formatDate(event.event_date)}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} /> {event.location}
                </span>
              )}
            </div>
            {event.cover_image && (
              <div className="mt-8 overflow-hidden">
                <img
                  src={mediaUrl(event.cover_image)}
                  alt={event.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
          </header>
        )}
      </div>

      <div className={`mx-auto max-w-4xl px-4 sm:px-6 ${hasHero ? '' : 'mt-12'}`}>
        <BlockRenderer blocks={event.blocks || []} />

        {mediaItems.length > 1 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-3xl font-semibold">Galería multimedia</h2>
            <MediaCarousel items={mediaItems} />
          </section>
        )}

        <div className="mt-16">
          <CommentsSection eventId={event.id} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl border-t border-line px-4 pt-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">Eventos relacionados</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((ev, i) => (
              <EventCard key={ev.id} event={ev} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
