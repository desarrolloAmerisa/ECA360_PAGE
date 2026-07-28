import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Keyboard, FreeMode } from 'swiper/modules'
import { Expand, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Video from 'yet-another-react-lightbox/plugins/video'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'yet-another-react-lightbox/styles.css'
import { mediaUrl } from '../../services/api'

/**
 * Carrusel con marco de altura FIJA.
 * Las imágenes se adaptan con object-cover/contain; no crecen a tamaño natural.
 */
export default function MediaCarousel({ items = [], fit = 'cover' }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const videoRefs = useRef({})

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idx, el]) => {
      if (!el) return
      if (Number(idx) !== active) el.pause()
    })
  }, [active])

  if (!items.length) return null

  const objectFit = fit === 'contain' ? 'object-contain' : 'object-cover'

  const slides = items.map((item) => {
    if (item.type === 'video') {
      return {
        type: 'video',
        width: 1280,
        height: 720,
        sources: [{ src: mediaUrl(item.src), type: 'video/mp4' }],
        poster: item.poster ? mediaUrl(item.poster) : undefined,
      }
    }
    return { src: mediaUrl(item.src) }
  })

  return (
    <div className="relative w-full max-w-full">
      {/* Marco fijo: no deja que la imagen dicte la altura */}
      <div className="relative w-full overflow-hidden bg-zinc-950" style={{ height: 'min(52vw, 420px)', maxHeight: 420 }}>
        <Swiper
          modules={[Navigation, Thumbs, Keyboard]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation={{ prevEl: '.media-prev', nextEl: '.media-next' }}
          keyboard
          spaceBetween={0}
          observer
          observeParents
          onSlideChange={(s) => setActive(s.activeIndex)}
          className="absolute inset-0 h-full w-full"
        >
          {items.map((item, i) => (
            <SwiperSlide key={`${item.src}-${i}`} style={{ height: '100%' }}>
              <div className="flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
                {item.type === 'video' ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el
                    }}
                    src={mediaUrl(item.src)}
                    poster={item.poster ? mediaUrl(item.poster) : undefined}
                    controls
                    playsInline
                    className={`h-full w-full ${objectFit}`}
                    onPlay={() => {
                      Object.entries(videoRefs.current).forEach(([idx, el]) => {
                        if (Number(idx) !== i && el) el.pause()
                      })
                    }}
                  />
                ) : (
                  <img
                    src={mediaUrl(item.src)}
                    alt={item.alt || ''}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full ${objectFit} object-center`}
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className="media-prev absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          className="media-next absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          aria-label="Siguiente"
        >
          <ChevronRight size={20} />
        </button>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow hover:bg-white"
        >
          <Expand size={14} /> Pantalla completa
        </button>
      </div>

      <Swiper
        modules={[FreeMode, Thumbs]}
        onSwiper={setThumbsSwiper}
        spaceBetween={8}
        slidesPerView="auto"
        freeMode
        watchSlidesProgress
        className="mt-3"
      >
        {items.map((item, i) => (
          <SwiperSlide key={`thumb-${i}`} style={{ width: 72 }}>
            <button
              type="button"
              className={`relative aspect-square w-full overflow-hidden border-2 ${
                active === i ? 'border-brand' : 'border-transparent'
              }`}
            >
              {item.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-ink text-white">
                  <Play size={14} />
                </div>
              ) : (
                <img
                  src={mediaUrl(item.src)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={active}
        slides={slides}
        plugins={[Video]}
      />
    </div>
  )
}
