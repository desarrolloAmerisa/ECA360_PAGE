/** Client-side copies of backend templates for instant editor apply */
const base = (blocks) =>
  blocks.map((b, i) => ({
    type: b.type,
    position: i,
    content: { ...b.content },
    settings: { ...(b.settings || {}) },
  }))

const templates = {
  boda: base([
    { type: 'hero', content: { title: 'Nuestra Boda', subtitle: 'Un día lleno de amor', image: '', overlay: true }, settings: { align: 'center', height: 'large' } },
    { type: 'title', content: { text: 'La celebración' }, settings: { align: 'center', size: 'xl' } },
    { type: 'paragraph', content: { text: 'Compartimos con ustedes los mejores momentos de esta celebración especial.' }, settings: { align: 'center' } },
    { type: 'gallery', content: { images: [], columns: 3 }, settings: {} },
    { type: 'quote', content: { text: 'El amor no se mira, se siente, y aún más cuando se vive juntos.', author: '' }, settings: { align: 'center' } },
    { type: 'carousel', content: { items: [] }, settings: {} },
  ]),
  xv_anos: base([
    { type: 'hero', content: { title: 'Mis XV Años', subtitle: 'Una noche de ensueño', image: '', overlay: true }, settings: { align: 'center', height: 'large' } },
    { type: 'subtitle', content: { text: 'El vals, los momentos y las sonrisas' }, settings: { align: 'center' } },
    { type: 'paragraph', content: { text: 'Gracias a todos los que formaron parte de esta celebración tan especial.' }, settings: { align: 'center' } },
    { type: 'gallery', content: { images: [], columns: 3 }, settings: {} },
    { type: 'video_youtube', content: { url: '', caption: 'Video de la celebración' }, settings: {} },
    { type: 'carousel', content: { items: [] }, settings: {} },
  ]),
  graduacion: base([
    { type: 'hero', content: { title: 'Graduación', subtitle: 'Logros que celebramos juntos', image: '', overlay: true }, settings: { align: 'center', height: 'large' } },
    { type: 'title', content: { text: 'Un logro compartido' }, settings: { align: 'left', size: 'lg' } },
    { type: 'two_columns', content: { left: 'El esfuerzo de años se refleja en esta gran noche.', right: 'Familia, amigos y maestros: gracias por acompañarnos.' }, settings: {} },
    { type: 'gallery', content: { images: [], columns: 4 }, settings: {} },
    { type: 'carousel', content: { items: [] }, settings: {} },
  ]),
  corporativo: base([
    { type: 'hero', content: { title: 'Evento Corporativo', subtitle: 'Conectando ideas y personas', image: '', overlay: true }, settings: { align: 'left', height: 'medium' } },
    { type: 'title', content: { text: 'Resumen del evento' }, settings: { align: 'left', size: 'lg' } },
    { type: 'paragraph', content: { text: 'Una jornada de networking, presentaciones y momentos clave para la organización.' }, settings: { align: 'left' } },
    { type: 'list', content: { items: ['Bienvenida', 'Conferencias', 'Networking', 'Cierre'], ordered: false }, settings: {} },
    { type: 'gallery', content: { images: [], columns: 3 }, settings: {} },
    { type: 'button', content: { label: 'Contactar', url: '#', style: 'primary' }, settings: { align: 'center' } },
  ]),
  evento_libre: base([
    { type: 'hero', content: { title: 'Nuevo Evento', subtitle: 'Personaliza cada detalle', image: '', overlay: true }, settings: { align: 'center', height: 'large' } },
    { type: 'paragraph', content: { text: 'Comienza a construir tu historia con bloques.' }, settings: { align: 'left' } },
    { type: 'spacer', content: { height: 40 }, settings: {} },
    { type: 'gallery', content: { images: [], columns: 3 }, settings: {} },
  ]),
}

export default templates
