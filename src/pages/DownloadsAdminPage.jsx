import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const empty = { title: '', type: 'Brochure', category: 'product', sizeLabel: '', fileUrl: '', isPublished: true }

export default function DownloadsAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/downloads').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    if (editId) await api(`/downloads/${editId}`, { method: 'PUT', body: JSON.stringify(form) })
    else await api('/downloads', { method: 'POST', body: JSON.stringify(form) })
    setForm(empty)
    setEditId(null)
    load()
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'downloads')
    setForm((f) => ({ ...f, fileUrl: url, filePublicId: publicId, sizeLabel: `${(file.size / 1024 / 1024).toFixed(1)} MB` }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-4">Downloads & Compliance Assets</h1>
      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div className="grid grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['Brochure', 'Datasheet', 'Catalog', 'Certificate', 'Policy', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="product">Product</option>
            <option value="compliance">Compliance</option>
            <option value="general">General</option>
          </select>
        </div>
        <input type="file" onChange={onFile} className="text-sm" />
        <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">{editId ? 'Update' : 'Add asset'}</button>
      </form>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex justify-between">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-slate-500">{i.type} · {i.category}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditId(i._id); setForm(i) }} className="text-sm text-indigo-600">Edit</button>
              <button type="button" onClick={async () => { await api(`/downloads/${i._id}`, { method: 'DELETE' }); load() }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
