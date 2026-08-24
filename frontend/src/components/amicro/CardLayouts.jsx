import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { mediaUrl } from '../../services/api'

function loadSize(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function median(nums) {
  if (!nums.length) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function resolveAspect(ratios) {
  if (!ratios.length) return 3 / 4
  return median(ratios)
}

function layoutForAspect(aspect, viewportW) {
  const isLandscape = aspect >= 1.15
  const isSquare = aspect >= 0.9 && aspect < 1.15

  let maxW
  let maxH
  if (isLandscape) {
    maxW = Math.min(viewportW * 0.78, 720)
    maxH = Math.min(viewportW < 640 ? 220 : 380, maxW / aspect)
  } else if (isSquare) {
    maxW = Math.min(viewportW * 0.55, 420)
    maxH = maxW / aspect
  } else {
    maxH = viewportW < 640 ? 340 : 460
    maxW = Math.min(viewportW * 0.52, maxH * aspect)
  }

  let cardW = maxW
  let cardH = cardW / aspect
  if (cardH > maxH) {
    cardH = maxH
    cardW = cardH * aspect
  }

  const stageH = Math.ceil(cardH * 1.18 + 24)
  const stepX = Math.max(cardW * 0.42, 72)
  const rotateY = isLandscape ? 28 : 40

  return { cardW, cardH, stageH, stepX, rotateY, objectFit: 'cover' }
}

const MAX_DOTS = 7
const SWIPE_THRESHOLD = 48

/**
 * Cover Flow 3D — swipe, contador compacto y sin desbordar en móvil.
 */
export function CoverFlowCarousel({
  images = [],
  onSelect,
  className = '',
  isMonochrome = false,
}) {
  const srcKey = images
    .map((img) => (typeof img === 'string' ? img : `${img.url || img.src}|${img.poster || ''}`))
    .join('||')

  const items = useMemo(
    () =>
      images
        .map((img) => {
          if (typeof img === 'string') return { src: img, title: '', type: 'image' }
          return {
            src: img.url || img.src,
            title: img.alt || img.title || '',
            type: img.type || 'image',
            poster: img.poster,
          }
        })
        .filter((item) => item.src),
    [srcKey],
  )

  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.floor(items.length / 2), Math.max(0, items.length - 1)),
  )
  const [aspect, setAspect] = useState(3 / 4)
  const [viewportW, setViewportW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )

  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, items.length - 1)))
  }, [items.length])

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const sample = items.slice(0, 12)
      const sizes = await Promise.all(
        sample.map((item) => {
          const url = mediaUrl(item.type === 'video' && item.poster ? item.poster : item.src)
          return loadSize(url)
        }),
      )
      if (cancelled) return
      const ratios = sizes.filter(Boolean).map((s) => s.w / s.h)
      if (ratios.length) setAspect(resolveAspect(ratios))
    })()
    return () => {
      cancelled = true
    }
  }, [items])

  const layout = useMemo(() => layoutForAspect(aspect, viewportW), [aspect, viewportW])

  if (items.length < 1) return null

  const toPrev = () => setActiveIndex((prev) => Math.max(0, prev - 1))
  const toNext = () => setActiveIndex((prev) => Math.min(items.length - 1, prev + 1))
  const toSlide = (index) => setActiveIndex(index)

  const onPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    }
    suppressClickRef.current = false
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    const start = dragRef.current
    if (!start || start.pointerId !== e.pointerId) return
    const dx = e.clientX - start.x
    if (Math.abs(dx) > 12) suppressClickRef.current = true
  }

  const onPointerUp = (e) => {
    const start = dragRef.current
    if (!start || start.pointerId !== e.pointerId) return
    const dx = e.clientX - start.x
    dragRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      suppressClickRef.current = true
      if (dx < 0) toNext()
      else toPrev()
    }
  }

  const handleCardClick = (e, i, isActive) => {
    e.stopPropagation()
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (isActive) onSelect?.(i)
    else toSlide(i)
  }

  const useCounter = items.length > MAX_DOTS
  const dotWindow = useMemo(() => {
    if (!useCounter && items.length <= MAX_DOTS) {
      return items.map((_, i) => i)
    }
    // Ventana pequeña centrada en el activo (por si algún día la usamos)
    const half = Math.floor(MAX_DOTS / 2)
    let start = Math.max(0, activeIndex - half)
    let end = Math.min(items.length, start + MAX_DOTS)
    start = Math.max(0, end - MAX_DOTS)
    return Array.from({ length: end - start }, (_, k) => start + k)
  }, [activeIndex, items.length, useCounter])

  return (
    <div
      className={`relative flex w-full select-none flex-col items-center justify-center ${className}`}
      style={{ perspective: '1400px' }}
      tabIndex={0}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Galería, foto ${activeIndex + 1} de ${items.length}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          toPrev()
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          toNext()
        }
        if (e.key === 'Enter' && onSelect) {
          e.preventDefault()
          onSelect(activeIndex)
        }
      }}
    >
      <div
        className="relative flex w-full touch-pan-y items-center justify-center overflow-hidden [transform-style:preserve-3d]"
        style={{ height: layout.stageH, touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null
        }}
      >
        {items.map((item, i) => {
          const isActive = activeIndex === i
          const offset = i - activeIndex
          const absOffset = Math.abs(offset)
          if (absOffset > 3) return null

          const isPast = i < activeIndex
          const src = mediaUrl(item.src)
          const poster = item.poster ? mediaUrl(item.poster) : src

          return (
            <motion.div
              key={`${item.src}-${i}`}
              className="absolute cursor-grab active:cursor-grabbing"
              initial={false}
              animate={{
                x: offset * layout.stepX,
                rotateY: isActive ? 0 : isPast ? layout.rotateY : -layout.rotateY,
                z: isActive ? 80 : -absOffset * 70,
                scale: isActive ? 1.05 : 1 - absOffset * 0.08,
                opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.2,
              }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              style={{
                zIndex: 100 - absOffset,
                width: layout.cardW,
                height: layout.cardH,
              }}
              onClick={(e) => handleCardClick(e, i, isActive)}
            >
              {isMonochrome ? (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-line bg-surface text-2xl font-bold text-muted shadow-xl">
                  {i + 1}
                </div>
              ) : (
                <div className="pointer-events-none relative h-full w-full overflow-hidden rounded-2xl bg-surface shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                  <img
                    src={item.type === 'video' ? poster : src}
                    alt={item.title || `Foto ${i + 1}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full"
                    style={{ objectFit: layout.objectFit }}
                    loading={absOffset <= 1 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                  {item.type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                      <Play size={36} fill="currentColor" className="drop-shadow-lg" />
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="z-20 mt-4 flex w-full max-w-sm items-center justify-center gap-3 px-2 sm:mt-6">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toPrev()
          }}
          disabled={activeIndex === 0}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {useCounter ? (
          <div className="min-w-0 flex-1 text-center">
            <p className="text-sm font-medium tabular-nums text-ink">
              {activeIndex + 1}
              <span className="text-muted"> / {items.length}</span>
            </p>
            <div className="mx-auto mt-2 h-1 max-w-[140px] overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden">
            {dotWindow.map((i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  toSlide(i)
                }}
                className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-6 bg-brand' : 'w-1.5 bg-line hover:bg-muted'
                }`}
                aria-label={`Ir a ${i + 1}`}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toNext()
          }}
          disabled={activeIndex === items.length - 1}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-3 px-4 text-center text-xs text-muted">
        Desliza · toca la central para ver / descargar
      </p>
    </div>
  )
}

/** Amicro card-arc: abanico al hover */
export function CardArcSpread({ images = [], onSelect, className = '' }) {
  const [hovered, setHovered] = useState(false)
  const items = images.slice(0, 5)
  if (items.length < 2) return null
  const center = Math.floor((items.length - 1) / 2)
  const angle = 28
  const gap = 64

  return (
    <div
      className={`relative mx-auto flex h-52 w-full max-w-md cursor-pointer items-center justify-center sm:h-64 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ perspective: 900 }}
    >
      {items.map((img, i) => {
        const dist = i - center
        const src = typeof img === 'string' ? img : img.url || img.src
        return (
          <motion.button
            key={i}
            type="button"
            onClick={() => onSelect?.(i)}
            animate={{
              rotate: hovered ? dist * (angle / Math.max(center, 1)) : dist * 2,
              x: hovered ? dist * (gap / Math.max(center, 1)) : dist * 8,
              y: hovered ? (Math.abs(dist) === 0 ? -14 : Math.abs(dist) * 6) : 0,
              scale: hovered && dist === 0 ? 1.08 : 1,
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 20, mass: 0.8 }}
            style={{ zIndex: 10 - Math.abs(dist) }}
            className="absolute h-40 w-28 overflow-hidden rounded-xl border border-white/20 bg-surface shadow-lg sm:h-48 sm:w-32"
          >
            <img src={mediaUrl(src)} alt="" className="h-full w-full object-cover" loading="lazy" />
          </motion.button>
        )
      })}
      <p className="pointer-events-none absolute -bottom-2 text-[11px] font-medium uppercase tracking-wider text-muted">
        {hovered ? 'Toca una foto' : 'Pasa el cursor'}
      </p>
    </div>
  )
}
