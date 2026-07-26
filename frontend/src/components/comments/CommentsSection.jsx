import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { commentsApi } from '../../services/api'
import { formatDate } from '../../lib/utils'

export default function CommentsSection({ eventId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const load = async () => {
    try {
      const { data } = await commentsApi.byEvent(eventId)
      setComments(data)
    } catch {
      toast.error('No se pudieron cargar los comentarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [eventId])

  const onSubmit = async (values) => {
    try {
      const { data } = await commentsApi.create({ ...values, event_id: eventId })
      setComments((prev) => [data, ...prev])
      reset()
      toast.success('Comentario publicado')
    } catch {
      toast.error('Error al publicar comentario')
    }
  }

  return (
    <section className="border-t border-line pt-12">
      <h2 className="font-display text-3xl font-semibold">Comentarios</h2>
      <p className="mt-2 text-sm text-muted">Sin registro. Comparte tu mensaje.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
        <div>
          <input
            {...register('name', { required: 'Nombre requerido', maxLength: 120 })}
            placeholder="Tu nombre"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          />
          {errors.name && <p className="mt-1 text-xs text-brand">{errors.name.message}</p>}
        </div>
        <div>
          <textarea
            {...register('content', { required: 'Escribe un comentario', maxLength: 2000 })}
            rows={4}
            placeholder="Tu comentario..."
            className="w-full resize-y border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          />
          {errors.content && <p className="mt-1 text-xs text-brand">{errors.content.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="justify-self-start bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : 'Publicar comentario'}
        </button>
      </form>

      <div className="mt-10 space-y-6">
        {loading && (
          <div className="space-y-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-muted">Sé el primero en comentar.</p>
        )}
        {comments.map((c, i) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="border-b border-line pb-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h4 className="font-semibold text-ink">{c.name}</h4>
              <time className="text-xs text-muted">{formatDate(c.created_at)}</time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{c.content}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
