import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'
import RichTextEditor from '@/components/RichTextEditor'

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  coverImagePublicId: '',
  author: 'SEPL Team',
  tags: '',
  isPublished: true,
  publishedAt: new Date().toISOString().slice(0, 10),
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function BlogsAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => api('/blogs').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        publishedAt: form.publishedAt ? new Date(form.publishedAt) : new Date(),
      }
      if (editId) {
        await api(`/blogs/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await api('/blogs', { method: 'POST', body: JSON.stringify(payload) })
      }
      setForm(empty)
      setEditId(null)
      load()
    } catch (err) {
      alert(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'blogs')
    setForm((f) => ({ ...f, coverImageUrl: url, coverImagePublicId: publicId }))
  }

  const startEdit = (item) => {
    setEditId(item._id)
    setForm({
      ...item,
      tags: (item.tags || []).join(', '),
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Blog Posts</h1>
      <p className="text-sm text-slate-500 mb-4">Create articles with rich text. Cover and inline images upload to Cloudinary.</p>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
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
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-slate-600"
          placeholder="URL slug (auto from title)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={2}
          placeholder="Short excerpt for listing cards"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
          />
        </div>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Cover image</label>
          <input type="file" accept="image/*" onChange={onCover} className="text-sm" />
          {form.coverImageUrl && (
            <img src={form.coverImageUrl} alt="Cover" className="mt-2 h-28 rounded-lg object-cover border" />
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Content</label>
          <RichTextEditor value={form.content} onChange={(content) => setForm((f) => ({ ...f, content }))} />
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
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving…' : editId ? 'Update post' : 'Publish post'}
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
            {i.coverImageUrl && (
              <img src={i.coverImageUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{i.title}</div>
              <div className="text-sm text-slate-500">/{i.slug} · {i.isPublished ? 'Published' : 'Draft'}</div>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">{i.excerpt}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button type="button" onClick={() => startEdit(i)} className="text-sm text-indigo-600">Edit</button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Delete this post?')) return
                  await api(`/blogs/${i._id}`, { method: 'DELETE' })
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
