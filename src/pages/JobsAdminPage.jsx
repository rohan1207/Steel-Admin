import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const empty = {
  title: '',
  department: 'Engineering',
  location: 'Pune, Maharashtra',
  type: 'Full Time',
  experience: '',
  description: '',
  requirements: '',
  isActive: true,
  sortOrder: 0,
}

export default function JobsAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/jobs').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      requirements: form.requirements
        ? String(form.requirements).split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
    }
    if (editId) await api(`/jobs/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    else await api('/jobs', { method: 'POST', body: JSON.stringify(payload) })
    setForm(empty)
    setEditId(null)
    load()
  }

  const startEdit = (item) => {
    setEditId(item._id)
    setForm({ ...item, requirements: (item.requirements || []).join('\n') })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-4">Careers / Job Board</h1>
      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Requirements (one per line)" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active listing
        </label>
        <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">{editId ? 'Update job' : 'Add job'}</button>
      </form>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex justify-between gap-4">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-slate-500">{i.department} · {i.location} · {i.isActive ? 'Active' : 'Closed'}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => startEdit(i)} className="text-sm text-indigo-600">Edit</button>
              <button type="button" onClick={async () => { await api(`/jobs/${i._id}`, { method: 'DELETE' }); load() }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
