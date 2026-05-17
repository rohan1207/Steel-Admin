import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'

const CHART_COLORS = [
  '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#312e81',
  '#4338ca', '#3730a3', '#1e1b4b', '#c7d2fe', '#e0e7ff', '#94a3b8',
]

function ContentBarChart({ items }) {
  const numeric = items.map((i) => Number(i.value) || 0)
  const max = Math.max(...numeric, 1)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const n = numeric[i]
        const pct = Math.round((n / max) * 100)
        return (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1 gap-2">
              <span className="text-slate-600 truncate">{item.label}</span>
              <span className="font-semibold text-navy-900 shrink-0">{item.value}</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContentDonut({ items }) {
  const total = items.reduce((sum, i) => sum + (Number(i.value) || 0), 0)
  if (!total) {
    return <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
  }

  let offset = 0
  const segments = items.map((item, i) => {
    const n = Number(item.value) || 0
    const pct = (n / total) * 100
    const start = offset
    offset += pct
    return { ...item, pct, start, color: CHART_COLORS[i % CHART_COLORS.length] }
  })

  const gradient = `conic-gradient(${segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(', ')})`

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="relative w-40 h-40 rounded-full shrink-0"
        style={{ background: gradient }}
        aria-hidden
      >
        <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-navy-900">{total}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">items</p>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5 text-xs max-h-48 overflow-y-auto">
        {segments.filter((s) => s.pct > 0).map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600 truncate flex-1">{s.label}</span>
            <span className="text-slate-400">{Math.round(s.pct)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api('/stats').then(setStats).catch(() => setStats(null))
  }, [])

  const cards = [
    { label: 'Total leads', value: stats?.leads ?? '—', to: '/leads' },
    { label: 'Active jobs', value: stats?.jobs ?? '—', to: '/jobs' },
    { label: 'Published projects', value: stats?.projects ?? '—', to: '/projects' },
    { label: 'Download assets', value: stats?.downloads ?? '—', to: '/downloads' },
    { label: 'CSR events', value: stats?.csr ?? '—', to: '/csr' },
    { label: 'Published blogs', value: stats?.blogs ?? '—', to: '/blogs' },
    { label: 'Certifications', value: stats?.certifications ?? '—', to: '/certifications' },
    { label: 'Products', value: stats?.products ?? '—', to: '/products' },
    { label: 'Clients', value: stats?.clients ?? '—', to: '/clients' },
    { label: 'Gallery tiles', value: stats?.gallery ?? '—', to: '/gallery' },
    { label: 'Global markets', value: stats?.globalPresence ?? '—', to: '/global-presence' },
  ]

  const chartItems = useMemo(
    () =>
      cards
        .filter((c) => c.label !== 'Total leads')
        .map((c) => ({ label: c.label, value: c.value })),
    [stats],
  )

  const leadsCard = cards[0]

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-2">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Manage website content and review lead tracking.</p>

      <Link
        to={leadsCard.to}
        className="block bg-indigo-600 text-white rounded-xl p-5 mb-6 hover:bg-indigo-700 transition-colors max-w-sm"
      >
        <p className="text-sm text-indigo-100">{leadsCard.label}</p>
        <p className="text-4xl font-bold mt-1">{leadsCard.value}</p>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.slice(1).map((c) => (
          <Link key={c.to} to={c.to} className="bg-white border rounded-xl p-5 hover:border-indigo-300 transition-colors">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold text-navy-900 mt-1">{c.value}</p>
          </Link>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-1">Content comparison</h2>
            <p className="text-sm text-slate-500 mb-5">Relative size of each CMS module (excludes leads).</p>
            <ContentBarChart items={chartItems} />
          </section>
          <section className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-1">Content mix</h2>
            <p className="text-sm text-slate-500 mb-5">Share of published website content.</p>
            <ContentDonut items={chartItems} />
          </section>
        </div>
      )}
    </div>
  )
}
