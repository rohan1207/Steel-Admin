import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const empty = {
  title: '',
  slug: '',
  description: '',
  image: '',
  imagePublicId: '',
  icon: '⚙️',
  tag: '',
  subtitle: '',
  heroImage: '',
  heroImagePublicId: '',
  gallery: [],
  introText: '',
  highlights: [{ label: '', value: '' }],
  featuresText: '',
  applicationsText: '',
  specificationsText: '',
  clientsText: '',
  isPublished: true,
  isFeatured: false,
  sortOrder: 0,
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function linesToArray(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function arrayToLines(arr) {
  return (arr || []).join('\n')
}

function itemToForm(item) {
  return {
    title: item.title || '',
    slug: item.slug || '',
    description: item.description || '',
    image: item.image || '',
    imagePublicId: item.imagePublicId || '',
    icon: item.icon || '⚙️',
    tag: item.tag || '',
    subtitle: item.subtitle || '',
    heroImage: item.heroImage || '',
    heroImagePublicId: item.heroImagePublicId || '',
    gallery: item.gallery || [],
    introText: arrayToLines(item.intro),
    highlights: item.highlights?.length ? item.highlights : [{ label: '', value: '' }],
    featuresText: arrayToLines(item.features),
    applicationsText: arrayToLines(item.applications),
    specificationsText: arrayToLines(item.specifications),
    clientsText: arrayToLines(item.clients),
    isPublished: item.isPublished !== false,
    isFeatured: Boolean(item.isFeatured),
    sortOrder: item.sortOrder ?? 0,
  }
}

function formToPayload(form) {
  return {
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description,
    image: form.image,
    imagePublicId: form.imagePublicId,
    icon: form.icon,
    tag: form.tag,
    subtitle: form.subtitle,
    heroImage: form.heroImage || form.image,
    heroImagePublicId: form.heroImagePublicId,
    gallery: form.gallery,
    intro: linesToArray(form.introText),
    highlights: (form.highlights || []).filter((h) => h.label || h.value),
    features: linesToArray(form.featuresText),
    applications: linesToArray(form.applicationsText),
    specifications: linesToArray(form.specificationsText),
    clients: linesToArray(form.clientsText),
    isPublished: form.isPublished,
    isFeatured: form.isFeatured,
    sortOrder: Number(form.sortOrder) || 0,
  }
}

export default function ProductsAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = () => api('/products').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = formToPayload(form)
    if (editId) {
      await api(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await api('/products', { method: 'POST', body: JSON.stringify(payload) })
    }
    setForm(empty)
    setEditId(null)
    load()
  }

  const uploadCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'products')
    setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))
  }

  const uploadHero = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'products')
    setForm((f) => ({ ...f, heroImage: url, heroImagePublicId: publicId }))
  }

  const uploadGallery = async (e) => {
    const files = [...(e.target.files || [])]
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const { url, publicId } = await uploadFile(file, 'products')
        uploaded.push({ url, publicId })
      }
      setForm((f) => ({ ...f, gallery: [...(f.gallery || []), ...uploaded] }))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const addHighlight = () => {
    setForm((f) => ({ ...f, highlights: [...(f.highlights || []), { label: '', value: '' }] }))
  }

  const updateHighlight = (index, field, value) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    }))
  }

  const removeHighlight = (index) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.filter((_, i) => i !== index),
    }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Products</h1>
      <p className="text-sm text-slate-500 mb-4">
        Manage product cards and detail pages. If the API has no products, the website uses built-in dummy data.
      </p>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-4 max-w-3xl">
        <h2 className="font-semibold text-navy-900">Listing (card)</h2>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          onBlur={() => {
            if (!form.slug && form.title) setForm((f) => ({ ...f, slug: slugify(f.title) }))
          }}
          required
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          placeholder="Slug (URL: /products/slug)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={2}
          placeholder="Short description (product card)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Icon emoji"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Badge tag (optional)"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Card image</label>
          <input type="file" accept="image/*" onChange={uploadCover} className="text-sm" />
          {form.image && <img src={form.image} alt="" className="mt-2 h-24 rounded object-cover border" />}
        </div>

        <h2 className="font-semibold text-navy-900 pt-2 border-t">Detail page</h2>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Detail subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Hero image (optional)</label>
          <input type="file" accept="image/*" onChange={uploadHero} className="text-sm" />
          {form.heroImage && <img src={form.heroImage} alt="" className="mt-2 h-24 rounded object-cover border" />}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Gallery images</label>
          <input type="file" accept="image/*" multiple onChange={uploadGallery} className="text-sm" disabled={uploading} />
          <div className="flex flex-wrap gap-2 mt-2">
            {(form.gallery || []).map((g, idx) => (
              <div key={`${g.url}-${idx}`} className="relative">
                <img src={g.url} alt="" className="h-16 w-16 object-cover rounded border" />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4"
                  onClick={() =>
                    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== idx) }))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={4}
          placeholder="Intro paragraphs (one per line)"
          value={form.introText}
          onChange={(e) => setForm({ ...form, introText: e.target.value })}
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Highlights</label>
            <button type="button" onClick={addHighlight} className="text-xs text-indigo-600">+ Add</button>
          </div>
          {(form.highlights || []).map((h, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Label"
                value={h.label}
                onChange={(e) => updateHighlight(idx, 'label', e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Value"
                  value={h.value}
                  onChange={(e) => updateHighlight(idx, 'value', e.target.value)}
                />
                <button type="button" onClick={() => removeHighlight(idx)} className="text-red-600 text-sm">×</button>
              </div>
            </div>
          ))}
        </div>

        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          rows={4}
          placeholder="Features (one per line)"
          value={form.featuresText}
          onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          rows={3}
          placeholder="Applications (one per line)"
          value={form.applicationsText}
          onChange={(e) => setForm({ ...form, applicationsText: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          rows={3}
          placeholder="Specifications (one per line)"
          value={form.specificationsText}
          onChange={(e) => setForm({ ...form, specificationsText: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          rows={3}
          placeholder="Clients (one per line)"
          value={form.clientsText}
          onChange={(e) => setForm({ ...form, clientsText: e.target.value })}
        />

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Published
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured on homepage
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">
            {editId ? 'Update product' : 'Add product'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm(empty) }}
              className="border rounded-lg py-2 px-4 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2 max-w-3xl">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex gap-4 justify-between">
            {i.image && <img src={i.image} alt="" className="w-16 h-16 object-cover rounded shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{i.title}</div>
              <div className="text-sm text-slate-500">
                /products/{i.slug} · {i.isPublished ? 'Live' : 'Draft'}
                {i.isFeatured ? ' · Featured' : ''}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { setEditId(i._id); setForm(itemToForm(i)) }}
                className="text-sm text-indigo-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Delete this product?')) return
                  await api(`/products/${i._id}`, { method: 'DELETE' })
                  load()
                }}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
