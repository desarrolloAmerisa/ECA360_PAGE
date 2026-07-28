import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Upload, RotateCcw } from 'lucide-react'
import { mediaUrl, settingsApi, uploadApi } from '../../services/api'
import { DEFAULT_SETTINGS, useSiteSettings } from '../../context/SiteSettingsContext'

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </label>
  )
}

const inputClass =
  'w-full border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand'

export default function AdminSettingsPage() {
  const { setSettings } = useSiteSettings()
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi
      .adminGet()
      .then(({ data }) => setForm({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => toast.error('No se pudo cargar la configuración'))
      .finally(() => setLoading(false))
  }, [])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const uploadImage = async (file, key) => {
    if (!file) return
    try {
      const { data } = await uploadApi.upload(file)
      set(key, data.url)
      toast.success('Imagen subida')
    } catch {
      toast.error('Error al subir')
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await settingsApi.update(form)
      setForm(data)
      setSettings(data)
      toast.success('Configuración guardada')
    } catch {
      toast.error('No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const resetDefaults = () => {
    if (!confirm('¿Restaurar textos y colores por defecto?')) return
    setForm((prev) => ({
      ...DEFAULT_SETTINGS,
      logo_url: prev.logo_url,
      favicon_url: prev.favicon_url,
    }))
  }

  if (loading) return <div className="skeleton h-64 max-w-3xl" />

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Configuración</h1>
          <p className="mt-1 text-sm text-muted">
            Edita la página principal, logo, textos y paleta de colores.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-2 border border-line bg-white px-3 py-2.5 text-sm hover:bg-surface"
          >
            <RotateCcw size={14} /> Defaults
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <section className="mt-8 border border-line bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Marca</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del sitio">
            <input className={inputClass} value={form.site_name} onChange={(e) => set('site_name', e.target.value)} />
          </Field>
          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
            <Field label="Logo" hint="Si subes un logo, reemplaza el monograma del nav/footer.">
              <div className="space-y-2">
                {form.logo_url ? (
                  <div className="flex items-center gap-3">
                    <img src={mediaUrl(form.logo_url)} alt="Logo" className="h-12 max-w-[180px] object-contain" />
                    <button type="button" className="text-xs text-brand" onClick={() => set('logo_url', null)}>
                      Quitar
                    </button>
                  </div>
                ) : null}
                <label className="inline-flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-xs font-medium hover:bg-surface">
                  <Upload size={14} /> Subir logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadImage(e.target.files?.[0], 'logo_url')}
                  />
                </label>
              </div>
            </Field>
            <Field label="Favicon">
              <div className="space-y-2">
                {form.favicon_url ? (
                  <div className="flex items-center gap-3">
                    <img src={mediaUrl(form.favicon_url)} alt="Favicon" className="h-8 w-8 object-contain" />
                    <button type="button" className="text-xs text-brand" onClick={() => set('favicon_url', null)}>
                      Quitar
                    </button>
                  </div>
                ) : null}
                <label className="inline-flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-xs font-medium hover:bg-surface">
                  <Upload size={14} /> Subir favicon
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadImage(e.target.files?.[0], 'favicon_url')}
                  />
                </label>
              </div>
            </Field>
          </div>
        </div>
      </section>

      <section className="mt-4 border border-line bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Página principal (hero)</h2>
        <div className="mt-4 space-y-4">
          <Field label="Eyebrow / etiqueta superior" hint="Ej: ECA360">
            <input className={inputClass} value={form.hero_eyebrow} onChange={(e) => set('hero_eyebrow', e.target.value)} />
          </Field>
          <Field label="Título principal">
            <input className={inputClass} value={form.hero_title} onChange={(e) => set('hero_title', e.target.value)} />
          </Field>
          <Field label="Subtítulo">
            <textarea
              rows={3}
              className={inputClass}
              value={form.hero_subtitle}
              onChange={(e) => set('hero_subtitle', e.target.value)}
            />
          </Field>
          <Field label="Texto del footer">
            <textarea
              rows={2}
              className={inputClass}
              value={form.footer_text}
              onChange={(e) => set('footer_text', e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-6 border border-dashed border-line bg-surface/60 p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: form.color_brand }}>
            {form.hero_eyebrow}
          </p>
          <p className="mt-3 font-display text-3xl font-semibold leading-tight" style={{ color: form.color_ink }}>
            {form.hero_title}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted">{form.hero_subtitle}</p>
        </div>
      </section>

      <section className="mt-4 border border-line bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Paleta de colores</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ['color_brand', 'Marca (rojo)'],
            ['color_brand_dark', 'Marca oscuro (hover)'],
            ['color_ink', 'Texto / negro'],
            ['color_surface', 'Fondo gris claro'],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="h-10 w-14 cursor-pointer border border-line bg-white p-1"
                />
                <input
                  className={inputClass}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </div>
            </Field>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {[form.color_brand, form.color_brand_dark, form.color_ink, form.color_surface, '#ffffff'].map((c) => (
            <div key={c} className="h-10 flex-1 border border-line" style={{ background: c }} title={c} />
          ))}
        </div>
      </section>

      <section className="mt-4 border border-line bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold">SEO del sitio</h2>
        <div className="mt-4 space-y-4">
          <Field
            label="URL pública del sitio"
            hint="Se usa en el QR y al copiar el link de /redes (ej. https://eca360.com.mx)"
          >
            <input
              className={inputClass}
              value={form.public_site_url || ''}
              onChange={(e) => set('public_site_url', e.target.value)}
              placeholder="https://eca360.com.mx"
            />
          </Field>
          <Field label="Título SEO (home)">
            <input className={inputClass} value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} />
          </Field>
          <Field label="Descripción SEO">
            <textarea
              rows={3}
              className={inputClass}
              value={form.seo_description}
              onChange={(e) => set('seo_description', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="mt-4 border border-line bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Autenticación</h2>
        <p className="mt-2 text-sm text-muted">
          La contraseña admin se define con{' '}
          <code className="bg-surface px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code> en el backend.
        </p>
      </section>
    </div>
  )
}
