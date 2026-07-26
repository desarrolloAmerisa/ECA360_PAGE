import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { eventsApi } from '../services/api'
import { useDebounce, useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'
import EventCard, { EventCardSkeleton } from '../components/events/EventCard'

export default function HomePage() {
  const { settings } = useSiteSettings()
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [years, setYears] = useState([])
  const debouncedSearch = useDebounce(search, 350)

  useSeo({
    title: settings.seo_title,
    description: settings.seo_description,
  })

  useEffect(() => {
    eventsApi.years().then(({ data }) => setYears(data)).catch(() => {})
  }, [])

  const fetchPage = useCallback(
    async (pageNum, replace = false) => {
      setLoading(true)
      try {
        const { data } = await eventsApi.list({
          page: pageNum,
          page_size: 9,
          search: debouncedSearch || undefined,
          year: year || undefined,
        })
        setEvents((prev) => (replace ? data.items : [...prev, ...data.items]))
        setHasMore(data.has_more)
        setPage(pageNum)
      } catch {
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, year],
  )

  useEffect(() => {
    fetchPage(1, true)
  }, [fetchPage])

  const sentinelRef = useInfiniteScroll(hasMore, loading, () => fetchPage(page + 1))

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_srgb,var(--color-brand)_12%,transparent),_transparent_50%),linear-gradient(180deg,#fff_0%,#f7f7f7_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-brand"
          >
            {settings.hero_eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl md:text-7xl"
          >
            {settings.hero_title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 max-w-xl text-base text-muted sm:text-lg"
          >
            {settings.hero_subtitle}
          </motion.p>
        </div>
      </section>

      <section id="buscar" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full border border-line bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand"
            />
          </div>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="">Todos los años</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
          {loading &&
            Array.from({ length: events.length ? 3 : 6 }).map((_, i) => <EventCardSkeleton key={`sk-${i}`} />)}
        </div>

        {!loading && events.length === 0 && (
          <p className="py-20 text-center text-muted">No hay eventos publicados todavía.</p>
        )}

        <div ref={sentinelRef} className="h-8" />
      </section>
    </div>
  )
}
