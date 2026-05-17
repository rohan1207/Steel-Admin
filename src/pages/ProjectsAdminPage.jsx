import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const empty = {
  title: '',
  summary: '',
  description: '',
  status: 'In Progress',
  category: 'Infrastructure',
  imageUrl: '',
  isPublished: true,
  sortOrder: 0,
}

export default function ProjectsAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/upcoming-projects').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    if (editId) await api(`/upcoming-projects/${editId}`, { method: 'PUT', body: JSON.stringify(form) })
    else await api('/upcoming-projects', { method: 'POST', body: JSON.stringify(form) })
    setForm(empty)
    setEditId(null)
    load()
  }

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'projects')
    setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-4">Upcoming Projects</h1>
      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          Published on website
        </label>
        <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">{editId ? 'Update' : 'Add project'}</button>
      </form>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex justify-between">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-slate-500">{i.status} · {i.isPublished ? 'Live' : 'Draft'}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditId(i._id); setForm(i) }} className="text-sm text-indigo-600">Edit</button>
              <button type="button" onClick={async () => { await api(`/upcoming-projects/${i._id}`, { method: 'DELETE' }); load() }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
