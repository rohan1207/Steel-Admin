import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const empty = {
  title: '',
  month: 'April',
  year: 2025,
  category: 'CSR',
  description: '',
  imageUrl: '',
  isPublished: true,
}

export default function CsrAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/csr-events').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, year: Number(form.year) }
    if (editId) await api(`/csr-events/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    else await api('/csr-events', { method: 'POST', body: JSON.stringify(payload) })
    setForm(empty)
    setEditId(null)
    load()
  }

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'csr')
    setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-4">CSR & Employee Welfare Calendar</h1>
      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div className="grid grid-cols-3 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['CSR', 'Employee Welfare', 'Health', 'Education', 'Environment'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          Published
        </label>
        <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">{editId ? 'Update' : 'Add event'}</button>
      </form>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex justify-between">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-slate-500">{i.month} {i.year} · {i.category}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditId(i._id); setForm(i) }} className="text-sm text-indigo-600">Edit</button>
              <button type="button" onClick={async () => { await api(`/csr-events/${i._id}`, { method: 'DELETE' }); load() }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
