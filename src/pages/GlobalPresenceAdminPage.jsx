import { useEffect, useState } from 'react'
import { api, uploadFile } from '@/lib/api'

const SEGMENTS = ['Middle East', 'Africa', 'Europe & Others']

const empty = {
  title: '',
  slug: '',
  subtitle: '',
  type: 'country',
  clientSegment: 'Middle East',
  countryCode: '',
  lng: '',
  lat: '',
  summary: '',
  description: '',
  highlightsText: '',
  projectsText: '',
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

function linesToArray(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function arrayToLines(arr) {
  return (arr || []).join('\n')
}

function parseProjects(text) {
  return linesToArray(text).map((line) => {
    const [title, summary = '', status = 'Delivered'] = line.split('|').map((s) => s.trim())
    return { title, summary, status }
  })
}

function projectsToText(projects) {
  return (projects || [])
    .map((p) => `${p.title}|${p.summary || ''}|${p.status || 'Delivered'}`)
    .join('\n')
}

function itemToForm(item) {
  return {
    title: item.title || '',
    slug: item.slug || '',
    subtitle: item.subtitle || '',
    type: item.type || 'country',
    clientSegment: item.clientSegment || 'Middle East',
    countryCode: item.countryCode || '',
    lng: item.coordinates?.[0] ?? '',
    lat: item.coordinates?.[1] ?? '',
    summary: item.summary || '',
    description: item.description || '',
    highlightsText: arrayToLines(item.highlights),
    projectsText: projectsToText(item.projects),
    image: item.image || '',
    imagePublicId: item.imagePublicId || '',
    isPublished: item.isPublished !== false,
    sortOrder: item.sortOrder ?? 0,
  }
}

export default function GlobalPresenceAdminPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const load = () => api('/global-presence').then(setItems)
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      subtitle: form.subtitle,
      type: form.type,
      clientSegment: form.clientSegment,
      countryCode: form.countryCode,
      coordinates: [Number(form.lng), Number(form.lat)],
      summary: form.summary,
      description: form.description,
      highlights: linesToArray(form.highlightsText),
      projects: parseProjects(form.projectsText),
      image: form.image,
      imagePublicId: form.imagePublicId,
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0,
    }
    if (editId) {
      await api(`/global-presence/${editId}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await api('/global-presence', { method: 'POST', body: JSON.stringify(payload) })
    }
    setForm(empty)
    setEditId(null)
    load()
  }

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url, publicId } = await uploadFile(file, 'global-presence')
    setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Global Presence</h1>
      <p className="text-sm text-slate-500 mb-4">
        Map pins and country detail pages. Coordinates: longitude, latitude (e.g. 54.37, 24.45 for UAE).
        Projects format: Title|Summary|Status (one per line).
      </p>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 mb-6 space-y-3 max-w-2xl">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Country / market title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} onBlur={() => { if (!form.slug && form.title) setForm((f) => ({ ...f, slug: slugify(f.title) })) }} required />
        <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.clientSegment} onChange={(e) => setForm({ ...form, clientSegment: e.target.value })}>
            {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Country code (AE)" value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Summary (map card)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Full description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm font-mono" rows={3} placeholder="Highlights (one per line)" value={form.highlightsText} onChange={(e) => setForm({ ...form, highlightsText: e.target.value })} />
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm font-mono" rows={3} placeholder="Projects: Title|Summary|Status" value={form.projectsText} onChange={(e) => setForm({ ...form, projectsText: e.target.value })} />
        <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          Published on map
        </label>
        <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">{editId ? 'Update' : 'Add location'}</button>
      </form>

      <div className="space-y-2 max-w-2xl">
        {items.map((i) => (
          <div key={i._id} className="bg-white border rounded-xl p-4 flex justify-between gap-3">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-slate-500">/{i.slug} · [{i.coordinates?.join(', ')}]</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => { setEditId(i._id); setForm(itemToForm(i)) }} className="text-sm text-indigo-600">Edit</button>
              <button type="button" onClick={async () => { if (!confirm('Delete?')) return; await api(`/global-presence/${i._id}`, { method: 'DELETE' }); load() }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
