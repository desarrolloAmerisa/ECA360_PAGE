export function formatDate(value, options = {}) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i += 1
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function youtubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export function createBlock(type) {
  const defaults = {
    hero: { content: { title: 'Título', subtitle: 'Subtítulo', image: '', overlay: true }, settings: { align: 'center', height: 'large' } },
    title: { content: { text: 'Título' }, settings: { align: 'left', size: 'xl' } },
    subtitle: { content: { text: 'Subtítulo' }, settings: { align: 'left' } },
    paragraph: { content: { text: 'Escribe tu párrafo aquí...' }, settings: { align: 'left' } },
    image: { content: { url: '', caption: '', alt: '' }, settings: { width: 'full' } },
    gallery: { content: { images: [], columns: 3 }, settings: {} },
    video_local: { content: { url: '', poster: '', caption: '' }, settings: {} },
    video_youtube: { content: { url: '', caption: '' }, settings: {} },
    carousel: { content: { items: [] }, settings: {} },
    two_columns: { content: { left: 'Columna izquierda', right: 'Columna derecha' }, settings: {} },
    button: { content: { label: 'Botón', url: '#', style: 'primary' }, settings: { align: 'center' } },
    quote: { content: { text: 'Una cita memorable.', author: '' }, settings: { align: 'center' } },
    table: { content: { headers: ['Columna 1', 'Columna 2'], rows: [['Dato', 'Dato']] }, settings: {} },
    list: { content: { items: ['Elemento 1', 'Elemento 2'], ordered: false }, settings: {} },
    divider: { content: {}, settings: { style: 'solid' } },
    spacer: { content: { height: 40 }, settings: {} },
  }
  const base = defaults[type] || { content: {}, settings: {} }
  return {
    id: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    position: 0,
    ...base,
  }
}

export const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero' },
  { type: 'title', label: 'Título' },
  { type: 'subtitle', label: 'Subtítulo' },
  { type: 'paragraph', label: 'Párrafo' },
  { type: 'image', label: 'Imagen' },
  { type: 'gallery', label: 'Galería' },
  { type: 'video_local', label: 'Video local' },
  { type: 'video_youtube', label: 'Video YouTube' },
  { type: 'carousel', label: 'Carrusel' },
  { type: 'two_columns', label: 'Dos columnas' },
  { type: 'button', label: 'Botón' },
  { type: 'quote', label: 'Cita' },
  { type: 'table', label: 'Tabla' },
  { type: 'list', label: 'Lista' },
  { type: 'divider', label: 'Separador' },
  { type: 'spacer', label: 'Espaciador' },
]

export function collectMediaFromBlocks(blocks = []) {
  const items = []
  for (const block of blocks) {
    if (block.type === 'image' && block.content?.url) {
      items.push({ type: 'image', src: block.content.url, alt: block.content.alt || '' })
    }
    if (block.type === 'gallery') {
      for (const img of block.content?.images || []) {
        items.push({ type: 'image', src: typeof img === 'string' ? img : img.url, alt: img.alt || '' })
      }
    }
    if (block.type === 'video_local' && block.content?.url) {
      items.push({ type: 'video', src: block.content.url, poster: block.content.poster || '' })
    }
    if (block.type === 'carousel') {
      for (const item of block.content?.items || []) {
        items.push({
          type: item.type || 'image',
          src: item.url || item.src,
          poster: item.poster || '',
          alt: item.alt || '',
        })
      }
    }
  }
  return items.filter((i) => i.src)
}
