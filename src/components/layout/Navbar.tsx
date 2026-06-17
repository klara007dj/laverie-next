'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Droplets, LogOut, User } from 'lucide-react'

const NAV = [
  { to: '/',         label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/tarifs',   label: 'Tarifs' },
  { to: '/carte',    label: 'Stations' },
  { to: '/rapports', label: 'Rapports' },
  { to: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser]       = useState<{ prenom: string; nom: string } | null>(null)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    try { const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)) }
    catch {}
  }, [pathname])

  useEffect(() => { setOpen(false) }, [pathname])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  const isDashboard = pathname.startsWith('/dashboard')

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/rapports')) return null

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || isDashboard ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center">
              <Droplets className="text-white w-5 h-5" />
            </div>
            LaveriePro
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} href={to}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === to ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                }`}>{label}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-blue-700">
                  <User size={15} className="text-blue-500" /> {user.prenom} {user.nom}
                </Link>
                <button onClick={logout} className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut size={15} /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion" className="text-sm font-semibold text-slate-700 hover:text-blue-700">Connexion</Link>
                <Link href="/inscription" className="btn-primary text-sm py-2 px-5">S'inscrire</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-600">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {NAV.map(({ to, label }) => (
            <Link key={to} href={to}
              className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === to ? 'text-blue-700 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}>{label}</Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-2">
            {user ? (
              <>
                <Link href="/dashboard" className="text-center py-2 font-semibold text-blue-700">Mon espace</Link>
                <button onClick={logout} className="text-center py-2 font-semibold text-red-500">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/connexion" className="text-center py-2 font-semibold text-slate-700">Connexion</Link>
                <Link href="/inscription" className="btn-primary justify-center">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
