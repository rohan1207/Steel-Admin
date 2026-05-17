import { useEffect, useState } from 'react'
import { api, getToken } from '@/lib/api'

const TYPES = [
  '',
  'product_inquiry',
  'purchase_vendor',
  'career_application',
  'career_visit',
  'asset_download',
  'compliance_view',
  'general_enquiry',
  'contact',
]

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState([])
  const [typeFilter, setTypeFilter] = useState('')

  const load = () => {
    const q = typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : ''
    return api(`/leads${q}`).then(setLeads)
  }

  useEffect(() => { load() }, [typeFilter])

  const exportCsv = async () => {
    const q = typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : ''
    const res = await fetch(`/api/admin/leads/export${q}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sepl-leads.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-navy-900">Leads & Tracking</h1>
        <button type="button" onClick={exportCsv} className="bg-emerald-600 text-white rounded-lg py-2 px-4 text-sm font-semibold">
          Export CSV
        </button>
      </div>
      <select className="border rounded-lg px-3 py-2 text-sm mb-4" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
        {TYPES.map((t) => (
          <option key={t || 'all'} value={t}>{t || 'All types'}</option>
        ))}
      </select>
      <div className="space-y-2 max-h-[70vh] overflow-auto">
        {leads.map((l) => (
          <div key={l._id} className="bg-white border rounded-xl p-4 text-sm">
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-indigo-700">{l.type}</span>
              <span className="text-slate-400">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-slate-700">{l.name} {l.email && `· ${l.email}`} {l.phone && `· ${l.phone}`}</p>
            <p className="text-slate-500">{l.sourcePage} {l.productSlug && `· product: ${l.productSlug}`} {l.jobTitle && `· ${l.jobTitle}`} {l.assetTitle && `· ${l.assetTitle}`}</p>
            {l.message && <p className="text-slate-600 mt-1 line-clamp-2">{l.message}</p>}
          </div>
        ))}
        {!leads.length && <p className="text-slate-500 text-sm">No leads yet.</p>}
      </div>
    </div>
  )
}
