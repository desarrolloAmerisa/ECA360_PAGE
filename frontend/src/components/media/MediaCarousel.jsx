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

export default function MediaCarousel({ items = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const videoRefs = useRef({})

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idx, el]) => {
      if (!el) return
      if (Number(idx) !== active) {
        el.pause()
      }
    })
  }, [active])

  if (!items.length) return null

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
    <div className="relative">
      <div className="relative overflow-hidden bg-ink">
        <Swiper
          modules={[Navigation, Thumbs, Keyboard]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation={{ prevEl: '.media-prev', nextEl: '.media-next' }}
          keyboard
          spaceBetween={0}
          onSlideChange={(s) => setActive(s.activeIndex)}
          className="aspect-[16/10]"
        >
          {items.map((item, i) => (
            <SwiperSlide key={`${item.src}-${i}`}>
              <div className="relative flex h-full w-full items-center justify-center bg-black">
                {item.type === 'video' ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el
                    }}
                    src={mediaUrl(item.src)}
                    poster={item.poster ? mediaUrl(item.poster) : undefined}
                    controls
                    playsInline
                    className="max-h-full max-w-full"
                    onPlay={(e) => {
                      Object.entries(videoRefs.current).forEach(([idx, el]) => {
                        if (Number(idx) !== i && el) el.pause()
                      })
                    }}
                  />
                ) : (
                  <img
                    src={mediaUrl(item.src)}
                    alt={item.alt || ''}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button type="button" className="media-prev absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white">
          <ChevronLeft size={20} />
        </button>
        <button type="button" className="media-next absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white">
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
          <SwiperSlide key={`thumb-${i}`} style={{ width: 88 }}>
            <button
              type="button"
              className={`relative aspect-square w-full overflow-hidden border-2 ${
                active === i ? 'border-brand' : 'border-transparent'
              }`}
            >
              {item.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-ink text-white">
                  <Play size={16} />
                </div>
              ) : (
                <img src={mediaUrl(item.src)} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} index={active} slides={slides} plugins={[Video]} />
    </div>
  )
}
