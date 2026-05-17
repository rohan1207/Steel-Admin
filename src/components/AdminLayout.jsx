import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/jobs', label: 'Careers' },
  { to: '/projects', label: 'Upcoming Projects' },
  { to: '/downloads', label: 'Downloads' },
  { to: '/csr', label: 'CSR Calendar' },
  { to: '/leads', label: 'Leads & Export' },
  { to: '/blogs', label: 'Blog Posts' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/products', label: 'Products' },
  { to: '/clients', label: 'Clients' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/global-presence', label: 'Global Presence' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('sepl_admin_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-56 bg-navy-950 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <img src="/logo.png" alt="SEPL" className="h-10 w-full max-w-[140px] object-contain object-left" />
          <p className="text-[11px] text-indigo-300 mt-2">CMS & Lead Tracking</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={logout} className="m-3 py-2 text-sm text-red-300 hover:text-red-200 border border-white/10 rounded-lg">
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
