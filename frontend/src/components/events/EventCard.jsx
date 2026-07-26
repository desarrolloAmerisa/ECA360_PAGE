import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { mediaUrl } from '../../services/api'

export default function EventCard({ event, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
      className="group"
    >
      <Link to={`/evento/${event.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          {event.cover_image ? (
            <img
              src={mediaUrl(event.cover_image)}
              alt={event.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-line">
              <span className="font-display text-4xl text-muted/40">ECA360</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="pt-4">
          {event.template && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {event.template.replace('_', ' ')}
            </p>
          )}
          <h3 className="font-display text-2xl font-semibold leading-tight text-ink transition group-hover:text-brand">
            {event.title}
          </h3>
          {event.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.excerpt}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
            {event.event_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} /> {formatDate(event.event_date)}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} /> {event.location}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export function EventCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-7 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  )
}
