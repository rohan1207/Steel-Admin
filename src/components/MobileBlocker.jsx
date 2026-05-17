import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'

const MOBILE_MQ = '(max-width: 767px)'

export default function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-indigo-900 p-6 text-center text-white">
        <div className="max-w-sm">
          <img src="/logo.png" alt="SEPL" className="h-11 w-auto mx-auto mb-6 object-contain" />
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <Monitor size={28} className="text-indigo-300" />
          </div>
          <h1 className="font-display font-700 text-xl mb-2">View on desktop</h1>
          <p className="text-sm text-indigo-200 leading-relaxed">
            The SEPL Admin panel is designed for desktop screens. Mobile support is coming soon.
          </p>
        </div>
      </div>
    )
  }

  return children
}
