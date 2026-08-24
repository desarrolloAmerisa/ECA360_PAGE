import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Download, Play, X } from 'lucide-react'
import toast from 'react-hot-toast'
import JSZip from 'jszip'
import { mediaUrl } from '../../services/api'

function itemSrc(item) {
  return mediaUrl(item.url || item.src)
}

function itemThumb(item) {
  if (item.type === 'video' && item.poster) return mediaUrl(item.poster)
  return itemSrc(item)
}

function fileName(item, i) {
  const raw = item.alt || item.caption || (item.type === 'video' ? `video-${i + 1}` : `foto-${i + 1}`)
  const base = String(raw).replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ ]+/g, '').trim() || `media-${i + 1}`
  const url = item.url || item.src || ''
  const extMatch = url.match(/\.(jpe?g|png|webp|gif|mp4|mov|webm)(\?|$)/i)
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : item.type === 'video' ? '.mp4' : '.jpg'
  return base.toLowerCase().endsWith(ext) ? base : `${base}${ext}`
}

async function fetchBlob(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo descargar')
  return res.blob()
}

function triggerDownload(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1500)
}

/**
 * Galería tipo álbum: ver, seleccionar y descargar (zip si hay varias).
 */
export default function MediaGalleryPicker({ open, items = [], initialIndex = 0, onClose }) {
  const list = useMemo(
    () => (items || []).filter((it) => it.url || it.src),
    [items],
  )
  const [selected, setSelected] = useState(() => new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [preview, setPreview] = useState(initialIndex)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setPreview(Math.min(Math.max(0, initialIndex), Math.max(0, list.length - 1)))
    setSelected(new Set())
    setSelectMode(false)
    setBusy(false)
  }, [open, initialIndex, list.length])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !list.length) return null

  const toggle = (i) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(list.map((_, i) => i)))
  const clearSel = () => setSelected(new Set())

  const downloadOne = async (i) => {
    const item = list[i]
    const blob = await fetchBlob(itemSrc(item))
    triggerDownload(blob, fileName(item, i))
  }

  const downloadSelected = async () => {
    const indexes = selectMode
      ? [...selected].sort((a, b) => a - b)
      : [preview]
    if (!indexes.length) {
      toast.error('Selecciona al menos una')
      return
    }
    setBusy(true)
    try {
      if (indexes.length === 1) {
        await downloadOne(indexes[0])
        toast.success('Descarga lista')
        return
      }
      const zip = new JSZip()
      for (const i of indexes) {
        const item = list[i]
        const blob = await fetchBlob(itemSrc(item))
        zip.file(fileName(item, i), blob)
      }
      const out = await zip.generateAsync({ type: 'blob' })
      triggerDownload(out, `eca360-galeria-${indexes.length}.zip`)
      toast.success(`${indexes.length} archivos en ZIP`)
    } catch {
      toast.error('No se pudo descargar. Prueba de uno en uno.')
    } finally {
      setBusy(false)
    }
  }

  const current = list[preview]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <header className="flex shrink-0 items-center gap-2 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {selectMode ? `${selected.size} seleccionadas` : `Galería · ${preview + 1} / ${list.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectMode((v) => !v)
              if (selectMode) clearSel()
            }}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20"
          >
            {selectMode ? 'Cancelar' : 'Seleccionar'}
          </button>
        </header>

        {/* Vista grande */}
        {!selectMode && current && (
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
            {current.type === 'video' ? (
              <video
                key={itemSrc(current)}
                src={itemSrc(current)}
                poster={current.poster ? mediaUrl(current.poster) : undefined}
                controls
                playsInline
                className="max-h-full max-w-full rounded-lg bg-black"
              />
            ) : (
              <img
                src={itemSrc(current)}
                alt={current.alt || ''}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            )}
          </div>
        )}

        {/* Grid de selección / miniaturas */}
        <div
          className={`shrink-0 border-t border-white/10 bg-black/80 ${
            selectMode ? 'flex-1 overflow-y-auto' : 'max-h-[28vh] overflow-x-auto'
          }`}
        >
          <div
            className={
              selectMode
                ? 'grid grid-cols-3 gap-1 p-2 sm:grid-cols-4 md:grid-cols-5'
                : 'flex gap-2 p-2'
            }
          >
            {list.map((item, i) => {
              const isOn = selectMode ? selected.has(i) : preview === i
              return (
                <button
                  key={`${itemSrc(item)}-${i}`}
                  type="button"
                  onClick={() => (selectMode ? toggle(i) : setPreview(i))}
                  className={`relative overflow-hidden bg-neutral-800 ${
                    selectMode ? 'aspect-square' : 'h-16 w-16 shrink-0 rounded-md sm:h-20 sm:w-20'
                  } ${isOn ? 'ring-2 ring-brand' : 'ring-1 ring-white/10'}`}
                >
                  <img
                    src={itemThumb(item)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {item.type === 'video' && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 p-0.5">
                      <Play size={10} fill="currentColor" />
                    </span>
                  )}
                  {selectMode && (
                    <span
                      className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        selected.has(i)
                          ? 'border-brand bg-brand text-white'
                          : 'border-white/80 bg-black/30'
                      }`}
                    >
                      {selected.has(i) ? <Check size={14} strokeWidth={3} /> : null}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-3 sm:px-4">
          {selectMode ? (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-full bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={clearSel}
                  className="rounded-full bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
                >
                  Ninguna
                </button>
              </div>
              <button
                type="button"
                disabled={busy || selected.size === 0}
                onClick={downloadSelected}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Download size={16} />
                {busy ? 'Preparando…' : `Descargar (${selected.size})`}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-white/50">Toca miniaturas · Seleccionar para varias</p>
              <button
                type="button"
                disabled={busy}
                onClick={downloadSelected}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
              >
                <Download size={16} />
                {busy ? '…' : 'Descargar esta'}
              </button>
            </>
          )}
        </footer>
      </motion.div>
    </AnimatePresence>
  )
}
