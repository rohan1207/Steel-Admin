import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const TYPES = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'export', label: 'Global Export' },
]

const empty = {
  name: '',
  slug: '',
  type: 'domestic',
  segment: '',
  presenceSlug: '',
  image: '',
  imagePublicId: '',
  isPublished: true,
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

export default function ClientsAdminPage() {
  const [items, setItems] = useState([])
  const [filterType, setFilterType] = useState('domestic')
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/clients').then(setItems)
  useEffect(() => { load() }, [])

  const filtered = items.filter((i) => i.type === filterType)

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
    if (editId) {
      await api(`/clients/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await api('/clients', { method: 'POST', body: JSON.stringify(payload) })
    }
    setForm({ ...empty, type: filterType })
    setEditId(null)
    load()
  }

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'clients')
    setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Clients</h1>
      <p className="text-sm text-slate-500 mb-4">
        Domestic and export client logos. Website falls back to built-in data if none are published.
      </p>

      <div className="flex gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setFilterType(t.value); setForm({ ...empty, type: t.value }) }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              filterType === t.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3 max-w-xl">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Client name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onBlur={() => {
            if (!form.slug && form.name) setForm((f) => ({ ...f, slug: slugify(f.name) }))
          }}
          required
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          placeholder="Slug (unique per type)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Segment (e.g. Oil, Gas & Refinery or Middle East)"
          value={form.segment}
          onChange={(e) => setForm({ ...form, segment: e.target.value })}
          required
        />
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {form.type === 'export' && (
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="Global presence slug (e.g. uae, nigeria)"
            value={form.presenceSlug || ''}
            onChange={(e) => setForm({ ...form, presenceSlug: e.target.value })}
          />
        )}
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Logo image</label>
          <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
          {form.image && <img src={form.image} alt="" className="mt-2 h-16 object-contain border rounded p-1" />}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">
            {editId ? 'Update client' : 'Add client'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm({ ...empty, type: filterType }) }}
              className="border rounded-lg py-2 px-4 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2 max-w-2xl">
        {filtered.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex gap-3 justify-between">
            {i.image && <img src={i.image} alt="" className="h-12 w-20 object-contain shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{i.name}</div>
              <div className="text-xs text-slate-500">{i.segment} · {i.isPublished ? 'Live' : 'Draft'}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { setEditId(i._id); setForm({ ...i, sortOrder: i.sortOrder ?? 0 }) }}
                className="text-sm text-indigo-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Delete?')) return
                  await api(`/clients/${i._id}`, { method: 'DELETE' })
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
