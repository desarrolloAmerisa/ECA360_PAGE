import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { mediaUrl } from '../../services/api'
import { youtubeId } from '../../lib/utils'
import MediaCarousel from '../media/MediaCarousel'

function alignClass(align) {
  if (align === 'center') return 'text-center mx-auto'
  if (align === 'right') return 'text-right ml-auto'
  return 'text-left'
}

export default function BlockRenderer({ blocks = [] }) {
  return (
    <div className="prose-event space-y-10">
      {blocks.map((block) => (
        <Block key={block.id || `${block.type}-${block.position}`} block={block} />
      ))}
    </div>
  )
}

function Block({ block }) {
  const { type, content = {}, settings = {} } = block

  switch (type) {
    case 'hero':
      return (
        <section className={`relative -mx-4 overflow-hidden sm:-mx-6 ${settings.height === 'large' ? 'min-h-[70vh]' : 'min-h-[48vh]'}`}>
          {content.image ? (
            <img src={mediaUrl(content.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-brand-dark" />
          )}
          {content.overlay !== false && <div className="absolute inset-0 bg-black/45" />}
          <div className={`relative z-10 flex h-full min-h-[inherit] items-center px-6 py-20 ${settings.align === 'left' ? 'justify-start' : 'justify-center text-center'}`}>
            <div className="max-w-3xl text-white">
              <h1 className="font-display text-5xl font-semibold leading-tight sm:text-6xl md:text-7xl">{content.title}</h1>
              {content.subtitle && <p className="mt-4 text-lg text-white/80 sm:text-xl">{content.subtitle}</p>}
            </div>
          </div>
        </section>
      )

    case 'title': {
      const sizes = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-4xl', xl: 'text-5xl' }
      return (
        <h2 className={`font-display font-semibold text-ink ${sizes[settings.size] || sizes.xl} ${alignClass(settings.align)}`}>
          {content.text}
        </h2>
      )
    }

    case 'subtitle':
      return <h3 className={`text-xl text-muted sm:text-2xl ${alignClass(settings.align)}`}>{content.text}</h3>

    case 'paragraph':
      return (
        <p className={`max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-ink/80 sm:text-lg ${alignClass(settings.align)}`}>
          {content.text}
        </p>
      )

    case 'image':
      return <ImageBlock content={content} settings={settings} />

    case 'gallery':
      return <GalleryBlock content={content} />

    case 'video_local':
      return (
        <figure>
          <video
            src={mediaUrl(content.url)}
            poster={content.poster ? mediaUrl(content.poster) : undefined}
            controls
            playsInline
            className="w-full bg-black"
          />
          {content.caption && <figcaption className="mt-2 text-center text-sm text-muted">{content.caption}</figcaption>}
        </figure>
      )

    case 'video_youtube': {
      const id = youtubeId(content.url)
      if (!id) return null
      return (
        <figure>
          <div className="aspect-video overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              title={content.caption || 'YouTube'}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {content.caption && <figcaption className="mt-2 text-center text-sm text-muted">{content.caption}</figcaption>}
        </figure>
      )
    }

    case 'carousel':
      return (
        <MediaCarousel
          items={(content.items || []).map((item) => ({
            type: item.type || 'image',
            src: item.url || item.src,
            poster: item.poster,
            alt: item.alt,
          }))}
        />
      )

    case 'two_columns':
      return (
        <div className="grid gap-8 md:grid-cols-2">
          <p className="whitespace-pre-wrap leading-relaxed text-ink/80">{content.left}</p>
          <p className="whitespace-pre-wrap leading-relaxed text-ink/80">{content.right}</p>
        </div>
      )

    case 'button':
      return (
        <div className={alignClass(settings.align)}>
          <a
            href={content.url || '#'}
            className={`inline-flex items-center rounded-none px-6 py-3 text-sm font-semibold transition ${
              content.style === 'secondary'
                ? 'border border-ink text-ink hover:bg-ink hover:text-white'
                : 'bg-brand text-white hover:bg-brand-dark'
            }`}
          >
            {content.label}
          </a>
        </div>
      )

    case 'quote':
      return (
        <blockquote className={`max-w-2xl border-l-4 border-brand pl-6 ${alignClass(settings.align)}`}>
          <p className="font-display text-2xl italic leading-snug text-ink sm:text-3xl">“{content.text}”</p>
          {content.author && <cite className="mt-3 block text-sm not-italic text-muted">— {content.author}</cite>}
        </blockquote>
      )

    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface">
                {(content.headers || []).map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(content.rows || []).map((row, ri) => (
                <tr key={ri} className="border-b border-line">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'list': {
      const Tag = content.ordered ? 'ol' : 'ul'
      return (
        <Tag className={`max-w-2xl space-y-2 ${content.ordered ? 'list-decimal' : 'list-disc'} pl-5 text-ink/80`}>
          {(content.items || []).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      )
    }

    case 'divider':
      return <hr className="border-line" />

    case 'spacer':
      return <div style={{ height: content.height || 40 }} aria-hidden />

    default:
      return null
  }
}

function ImageBlock({ content, settings }) {
  const [open, setOpen] = useState(false)
  if (!content.url) return null
  return (
    <>
      <figure className={settings.width === 'narrow' ? 'mx-auto max-w-xl' : ''}>
        <button type="button" onClick={() => setOpen(true)} className="block w-full">
          <img src={mediaUrl(content.url)} alt={content.alt || ''} loading="lazy" className="w-full" />
        </button>
        {content.caption && <figcaption className="mt-2 text-center text-sm text-muted">{content.caption}</figcaption>}
      </figure>
      <Lightbox open={open} close={() => setOpen(false)} slides={[{ src: mediaUrl(content.url) }]} />
    </>
  )
}

function GalleryBlock({ content }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const images = (content.images || []).map((img) => (typeof img === 'string' ? { url: img } : img))
  const cols = content.columns || 3

  if (!images.length) return null

  return (
    <>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            className="aspect-square overflow-hidden bg-surface"
            onClick={() => {
              setIndex(i)
              setOpen(true)
            }}
          >
            <img src={mediaUrl(img.url)} alt={img.alt || ''} loading="lazy" className="h-full w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((img) => ({ src: mediaUrl(img.url) }))}
      />
    </>
  )
}
