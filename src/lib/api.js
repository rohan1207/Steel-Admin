const API_BASE = '/api/admin'

export function getToken() {
  return localStorage.getItem('sepl_admin_token')
}

export async function api(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('sepl_admin_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Request failed')
  }

  const ct = res.headers.get('content-type') || ''
  if (ct.includes('text/csv')) return res.blob()
  return res.json()
}

export async function uploadFile(file, folder = 'misc') {
  const token = getToken()
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}
