import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const LAYOUTS = ['hero', 'wide', 'tall', 'medium', 'default']

const empty = {
  title: '',
  slug: '',
  category: 'Fluid Transfer',
  image: '',
  imagePublicId: '',
  href: '',
  layout: 'default',
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

export default function GalleryAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/gallery').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
    if (editId) {
      await api(`/gallery/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await api('/gallery', { method: 'POST', body: JSON.stringify(payload) })
    }
    setForm(empty)
    setEditId(null)
    load()
  }

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'gallery')
    setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Gallery</h1>
      <p className="text-sm text-slate-500 mb-4">
        Bento gallery tiles for homepage and /gallery. Falls back to built-in images if empty.
      </p>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3 max-w-xl">
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
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Category (filter label)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Link href (e.g. /products/loading-arms)"
          value={form.href}
          onChange={(e) => setForm({ ...form, href: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.layout}
            onChange={(e) => setForm({ ...form, layout: e.target.value })}
          >
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <input
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Image</label>
          <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
          {form.image && <img src={form.image} alt="" className="mt-2 h-28 w-full object-cover rounded border" />}
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
            {editId ? 'Update tile' : 'Add tile'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(empty) }} className="border rounded-lg py-2 px-4 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl overflow-hidden">
            {i.image && <img src={i.image} alt="" className="h-32 w-full object-cover" />}
            <div className="p-3 flex justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{i.title}</div>
                <div className="text-xs text-slate-500">{i.category} · {i.layout}</div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button type="button" onClick={() => { setEditId(i._id); setForm({ ...i, sortOrder: i.sortOrder ?? 0 }) }} className="text-xs text-indigo-600">Edit</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Delete?')) return
                    await api(`/gallery/${i._id}`, { method: 'DELETE' })
                    load()
                  }}
                  className="text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
