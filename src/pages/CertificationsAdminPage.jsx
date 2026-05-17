import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const CATEGORIES = ['Company Certificate', 'Vendor Certificate', 'Quality & Compliance', 'Other']

const empty = {
  title: '',
  description: '',
  category: 'Company Certificate',
  images: [],
  isPublished: true,
  sortOrder: 0,
}

export default function CertificationsAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = () => api('/certifications').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
    }
    if (editId) {
      await api(`/certifications/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await api('/certifications', { method: 'POST', body: JSON.stringify(payload) })
    }
    setForm(empty)
    setEditId(null)
    load()
  }

  const onImages = async (e) => {
    const files = [...(e.target.files || [])]
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const { url, publicId } = await uploadFile(file, 'certifications')
        uploaded.push({ url, publicId, caption: file.name.replace(/\.[^.]+$/, '') })
      }
      setForm((f) => ({ ...f, images: [...(f.images || []), ...uploaded] }))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const updateCaption = (index, caption) => {
    setForm((f) => ({
      ...f,
      images: f.images.map((img, i) => (i === index ? { ...img, caption } : img)),
    }))
  }

  const removeImage = (index) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }))
  }

  const startEdit = (item) => {
    setEditId(item._id)
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Company Certificate',
      images: item.images || [],
      isPublished: item.isPublished !== false,
      sortOrder: item.sortOrder ?? 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Certifications</h1>
      <p className="text-sm text-slate-500 mb-4">
        Each entry is a card with title, description, and one or more certificate images (Cloudinary).
      </p>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Certificate title (e.g. ISO 9001:2015)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={3}
          placeholder="Description / notes shown on the website"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
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
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Certificate images (add one or many)
          </label>
          <input type="file" accept="image/*" multiple onChange={onImages} className="text-sm" disabled={uploading} />
          {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading…</p>}
          {(form.images || []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {form.images.map((img, idx) => (
                <div key={`${img.url}-${idx}`} className="border rounded-lg p-2 bg-slate-50">
                  <img src={img.url} alt="" className="w-full h-24 object-contain rounded mb-2" />
                  <input
                    className="w-full border rounded px-2 py-1 text-xs mb-2"
                    placeholder="Caption (optional)"
                    value={img.caption || ''}
                    onChange={(e) => updateCaption(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published on website
        </label>

        <div className="flex gap-2">
          <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">
            {editId ? 'Update certificate' : 'Add certificate'}
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

      <div className="space-y-2">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex gap-4 justify-between">
            <div className="flex gap-3 flex-1 min-w-0">
              {(i.images || [])[0] && (
                <img src={i.images[0].url} alt="" className="w-16 h-16 object-contain rounded border shrink-0" />
              )}
              <div className="min-w-0">
                <div className="font-semibold truncate">{i.title}</div>
                <div className="text-sm text-slate-500">
                  {i.category} · {(i.images || []).length} image(s) · {i.isPublished ? 'Published' : 'Draft'}
                </div>
                {i.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{i.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button type="button" onClick={() => startEdit(i)} className="text-sm text-indigo-600">Edit</button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Delete this certificate?')) return
                  await api(`/certifications/${i._id}`, { method: 'DELETE' })
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
