'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Truck, CalendarCheck, Star, Gift, MapPin, History,
  LogOut, Droplets, Loader2, CheckCircle2, Clock, ChevronRight, Trophy,
  Plus, Edit2, Trash2, CheckCircle, XCircle, Shield, DollarSign, Users,
  MessageSquare, ToggleLeft, ToggleRight, Settings, Sparkles, Award
} from 'lucide-react'
import { fcfa, formatDate } from '@/lib/format'

interface DashData {
  user: { nom:string; prenom:string; email:string; loyaltyPoints:number; totalWashes:number; role:string }
  washes: any[]
  vouchers?: any[]
  clients?: any[]
  stations?: any[]
  services?: any[]
  totalWashes: number
  totalReservations: number
  totalRevenus?: number
  loyalty?: { next:number; progress:number; remaining:number }
}

const STATUT_BADGE: Record<string,string> = {
  COMPLETED:'bg-green-100 text-green-700 border border-green-200',
  PENDING:'bg-yellow-100 text-yellow-700 border border-yellow-200',
  IN_PROGRESS:'bg-blue-100 text-blue-700 border border-blue-200',
  CANCELLED:'bg-red-100 text-red-700 border border-red-200',
}
const STATUT_LABEL: Record<string,string> = {
  COMPLETED:'Terminé', PENDING:'En attente', IN_PROGRESS:'En cours', CANCELLED:'Annulé',
}

export default function DashboardPage() {
  const [data, setData]     = useState<DashData|null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState<string>('overview')
  const [stations, setStations] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  
  // Client States
  const [bookingStation, setBookingStation] = useState<any>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const [reviewWash, setReviewWash] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Admin CRUD States
  const [editingStation, setEditingStation] = useState<any>(null)
  const [showAddStation, setShowAddStation] = useState(false)
  const [stationForm, setStationForm] = useState({
    nom: '', quartier: '', adresse: '', latitude: 4.05, longitude: 9.7,
    heureOuverture: '06:00', heureFermeture: '22:00', totalPlaces: 3, placesLibres: 3, statut: 'ACTIVE'
  })

  const [editingService, setEditingService] = useState<any>(null)
  const [showAddService, setShowAddService] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    nom: '', description: '', prixFcfa: 10000, durationMinutes: 45, icon: 'Droplets', active: true
  })

  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const router = useRouter()

  const refreshData = () => {
    const token = localStorage.getItem('token')
    if (!token) return
    Promise.all([
      fetch('/api/dashboard', { headers:{ Authorization:`Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/stations').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([dash, stns, svcs]) => {
      if (dash.message || !dash.user) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/connexion')
        return
      }
      setData(dash)
      setStations(stns)
      setServices(svcs)
    }).catch(err => console.error("Error refreshing dashboard:", err))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/connexion'); return }

    Promise.all([
      fetch('/api/dashboard', { headers:{ Authorization:`Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/stations').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([dash, stns, svcs]) => {
      if (dash.message || !dash.user) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/connexion')
        return
      }
      setData(dash)
      setStations(stns)
      setServices(svcs)
      if (svcs.length > 0) setSelectedServiceId(svcs[0].id)
      
      // Default admin tab
      if (dash.user.role === 'ADMIN') {
        setTab('admin_overview')
      }
    }).catch(err => {
      console.error("Dashboard mount error:", err)
      router.push('/connexion')
    }).finally(() => setLoading(false))
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  // Admin Actions
  const handleUpdateWashStatus = async (washId: number, status: string) => {
    setActionLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/washes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: washId, statut: status })
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Erreur lors de la modification.')
      } else {
        refreshData()
      }
    } catch {
      alert('Erreur réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return
    setActionLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Erreur.')
      } else {
        refreshData()
      }
    } catch {
      alert('Erreur réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setActionError('')
    const token = localStorage.getItem('token')
    const method = editingStation ? 'PUT' : 'POST'
    const body = editingStation ? { id: editingStation.id, ...stationForm } : stationForm

    try {
      const res = await fetch('/api/stations', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json()
        setActionError(err.message || 'Erreur.')
      } else {
        setEditingStation(null)
        setShowAddStation(false)
        setStationForm({
          nom: '', quartier: '', adresse: '', latitude: 4.05, longitude: 9.7,
          heureOuverture: '06:00', heureFermeture: '22:00', totalPlaces: 3, placesLibres: 3, statut: 'ACTIVE'
        })
        refreshData()
      }
    } catch {
      setActionError('Erreur réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteStation = async (stationId: number) => {
    if (!confirm('Voulez-vous supprimer cette station ? (Cela supprimera également l\'historique associé)')) return
    setActionLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/stations?id=${stationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Erreur.')
      } else {
        refreshData()
      }
    } catch {
      alert('Erreur réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setActionError('')
    const token = localStorage.getItem('token')
    const method = editingService ? 'PUT' : 'POST'
    const body = editingService ? { id: editingService.id, ...serviceForm } : serviceForm

    try {
      const res = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json()
        setActionError(err.message || 'Erreur.')
      } else {
        setEditingService(null)
        setShowAddService(false)
        setServiceForm({
          nom: '', description: '', prixFcfa: 10000, durationMinutes: 45, icon: 'Droplets', active: true
        })
        refreshData()
      }
    } catch {
      setActionError('Erreur réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Voulez-vous supprimer ce service ? (Cela supprimera également les réservations associées)')) return
    setActionLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Erreur.')
      } else {
        refreshData()
      }
    } catch {
      alert('Erreur réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  // Client Actions
  const handleBook = async () => {
    if (!selectedServiceId || !bookingStation) return
    setIsBooking(true)
    setBookingError('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/washes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceId: selectedServiceId, stationId: bookingStation.id })
      })
      const result = await res.json()
      if (!res.ok) {
        setBookingError(result.message || 'Une erreur est survenue.')
      } else {
        setBookingStation(null)
        refreshData()
      }
    } catch {
      setBookingError('Erreur de connexion.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleReview = async () => {
    if (!reviewWash || !reviewComment) return
    setIsReviewing(true)
    setReviewError('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ washId: reviewWash.id, rating: reviewRating, comment: reviewComment })
      })
      const result = await res.json()
      if (!res.ok) {
        setReviewError(result.message || 'Une erreur est survenue.')
      } else {
        setReviewWash(null)
        setReviewComment('')
        setReviewRating(5)
        refreshData()
      }
    } catch {
      setReviewError('Erreur de connexion.')
    } finally {
      setIsReviewing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-700" size={40}/>
    </div>
  )

  if (!data) return null
  const { user, washes, totalWashes, totalReservations } = data

  const isClient = user.role !== 'ADMIN'

  // Admin Navigation Tabs
  const ADMIN_TABS = [
    { id: 'admin_overview',     label: 'Tableau de bord', icon: Shield },
    { id: 'admin_reservations', label: 'Réservations',   icon: CalendarCheck },
    { id: 'admin_stations',     label: 'Stations',       icon: MapPin },
    { id: 'admin_services',     label: 'Services & Tarifs', icon: Settings },
    { id: 'admin_clients',      label: 'Clients',        icon: Users },
    { id: 'admin_reviews',      label: 'Témoignages',    icon: MessageSquare },
  ]

  // Client Navigation Tabs
  const CLIENT_TABS = [
    { id: 'overview',      label: 'Accueil',        icon: Droplets },
    { id: 'reservations',  label: 'Réservations',   icon: CalendarCheck },
    { id: 'vehicles',      label: 'Véhicules',      icon: Truck },
    { id: 'vouchers',      label: 'Mes bons',       icon: Gift },
    { id: 'stations',      label: 'Stations',       icon: MapPin },
    { id: 'history',       label: 'Historique',     icon: History },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Bonjour, {user.prenom} {user.nom} 👋
              {user.role === 'ADMIN' && <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider shrink-0 shadow-sm">Admin</span>}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {user.role === 'ADMIN' ? 'Espace de gestion et d\'administration de LaveriePro.' : 'Prêt pour faire briller votre poids lourd aujourd\'hui ?'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link href="/rapports" className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5 bg-white shadow-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                <Shield size={14} className="text-blue-500"/> Rapports Généraux
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors font-medium">
              <LogOut size={16}/> Déconnexion
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-200">
          {(isClient ? CLIENT_TABS : ADMIN_TABS).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                tab === id
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/70'
              }`}>
              <Icon size={16}/> {label}
            </button>
          ))}
        </div>

        {/* ── CLIENT DASHBOARD VIEW ───────────────────────────────── */}
        {isClient && (
          <>
            {/* ── CLIENT: OVERVIEW */}
            {tab === 'overview' && data.loyalty && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: CalendarCheck, label: 'Réservations',    value: data.totalReservations, color: 'bg-blue-50 text-blue-700' },
                    { icon: Droplets,      label: 'Lavages effectués',value: data.totalWashes,       color: 'bg-green-50 text-green-700' },
                    { icon: Star,          label: 'Points fidélité',  value: user.loyaltyPoints,      color: 'bg-yellow-50 text-yellow-700' },
                    { icon: Gift,          label: 'Bons disponibles', value: data.vouchers?.length || 0, color: 'bg-purple-50 text-purple-700' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="card p-5 flex items-center gap-3 shadow-sm border-slate-100 bg-white">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={20}/></div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">{label}</div>
                        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-6 text-slate-800 relative overflow-hidden shadow-lg border border-yellow-200" style={{ background: 'linear-gradient(135deg, #FFD700, #FDB931)' }}>
                  <div className="absolute right-4 bottom-2 text-9xl opacity-10">👑</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={22} className="text-yellow-800"/>
                    <h3 className="font-bold text-lg text-yellow-900">Programme Fidélité</h3>
                  </div>
                  <p className="text-yellow-900 text-sm mb-4">
                    {data.loyalty.remaining > 0
                      ? `Encore ${data.loyalty.remaining} lavage${data.loyalty.remaining > 1 ? 's' : ''} pour atteindre le prochain palier (${data.loyalty.next} lavages)`
                      : 'Félicitations ! Vous avez atteint un palier 🎉'}
                  </p>
                  <div className="bg-white/30 rounded-full h-3 overflow-hidden mb-2">
                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${data.loyalty.progress}%` }}/>
                  </div>
                  <div className="flex justify-between text-xs text-yellow-900 font-semibold">
                    <span>{user.totalWashes} lavages effectués</span>
                    <span>Prochain palier : {data.loyalty.next}</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    {[{ n: 5, label: '5%' }, { n: 10, label: '10%' }, { n: 20, label: '🎁 Gratuit' }].map(({ n, label }) => (
                      <div key={n} className={`px-3 py-1 rounded-full text-xs font-bold ${user.totalWashes >= n ? 'bg-yellow-900 text-white shadow' : 'bg-white/30 text-yellow-900'}`}>
                        {n} lavages → {label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6 shadow-sm border-slate-100 bg-white">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><History size={18} className="text-blue-500"/> Derniers lavages</h3>
                  {washes.length === 0
                    ? <p className="text-slate-400 text-sm italic">Aucun lavage pour le moment.</p>
                    : washes.slice(0, 5).map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{w.service?.nom}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{w.station?.nom} · {formatDate(w.createdAt)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-slate-800">{fcfa(w.prixPaye)}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                          {w.statut === 'COMPLETED' && !w.review && (
                            <button onClick={() => { setReviewWash(w); setReviewError(''); }} className="text-xs text-blue-600 hover:text-white font-bold border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-600 transition-all shrink-0">Laisser un avis</button>
                          )}
                          {w.statut === 'COMPLETED' && w.review && (
                            <span className="text-xs text-slate-400 italic shrink-0">Avis laissé</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── CLIENT: RESERVATIONS */}
            {tab === 'reservations' && (
              <div className="card p-6 shadow-sm border-slate-100 bg-white">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Mes réservations</h2>
                {washes.filter((w:any) => w.statut === 'PENDING' || w.statut === 'IN_PROGRESS').length === 0
                  ? (
                    <div className="text-center py-12">
                      <CalendarCheck size={48} className="text-slate-200 mx-auto mb-4"/>
                      <p className="text-slate-400 mb-4">Aucune réservation en cours.</p>
                      <button onClick={() => setTab('stations')} className="btn-primary text-sm py-2 px-5">Réserver une station</button>
                    </div>
                  ) : washes.filter((w:any) => ['PENDING','IN_PROGRESS'].includes(w.statut)).map((w:any) => (
                    <div key={w.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 mb-3 hover:bg-slate-100/50 transition-all">
                      <div>
                        <div className="font-bold text-slate-800">{w.service?.nom}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{w.station?.nom} · {w.station?.adresse}</div>
                        <div className="text-xs text-slate-400 mt-1">{formatDate(w.createdAt)}</div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* ── CLIENT: VEHICLES */}
            {tab === 'vehicles' && (
              <div className="card p-6 shadow-sm border-slate-100 bg-white">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Mes véhicules</h2>
                <div className="text-center py-12">
                  <Truck size={48} className="text-slate-200 mx-auto mb-4"/>
                  <p className="text-slate-400 mb-2 font-semibold">Fonctionnalité disponible prochainement.</p>
                  <p className="text-slate-300 text-sm">Vous pourrez enregistrer vos poids lourds (immatriculation, type, gabarit).</p>
                </div>
              </div>
            )}

            {/* ── CLIENT: VOUCHERS */}
            {tab === 'vouchers' && data.vouchers && (
              <div className="card p-6 shadow-sm border-slate-100 bg-white">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Mes bons de réduction</h2>
                {data.vouchers.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift size={48} className="text-slate-200 mx-auto mb-4"/>
                    <p className="text-slate-400 mb-2">Aucun bon disponible pour le moment.</p>
                    <p className="text-slate-300 text-sm">Continuez à réserver pour débloquer vos récompenses fidélité !</p>
                  </div>
                ) : data.vouchers.map((v:any) => (
                  <div key={v.id} className="border-2 border-dashed border-yellow-300 bg-yellow-50/50 rounded-2xl p-5 mb-4 relative overflow-hidden">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10">🎫</div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-yellow-900 text-lg">{v.description}</div>
                        <div className="font-mono text-blue-900 font-bold text-xl mt-1 tracking-wider">{v.code}</div>
                        <div className="text-xs text-yellow-700 mt-2">
                          Créé le {formatDate(v.createdAt)} · Expire le {formatDate(v.expiresAt)}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${v.used ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {v.used ? 'Utilisé' : 'Disponible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CLIENT: STATIONS */}
            {tab === 'stations' && (
              <div>
                <h2 className="font-bold text-slate-900 text-xl mb-6">Nos stations — Douala</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stations.map((s:any) => {
                    const libre = s.statut === 'ACTIVE' && s.placesLibres > 0
                    return (
                      <div key={s.id} className="card p-5 bg-white shadow-sm border-slate-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-slate-900">{s.nom}</h3>
                              <p className="text-slate-400 text-xs mt-0.5">{s.adresse}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              s.statut === 'ACTIVE' && s.placesLibres > 0 ? 'bg-green-100 text-green-700 border border-green-200' :
                              s.statut === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {s.statut === 'MAINTENANCE' ? 'Maintenance' : s.placesLibres > 0 ? 'Libre' : 'Complet'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                            <Clock size={12}/> {s.heureOuverture} – {s.heureFermeture}
                            &nbsp;·&nbsp; Occupation : {s.totalPlaces - s.placesLibres}/{s.totalPlaces}
                          </div>
                        </div>
                        <button
                          disabled={!libre}
                          onClick={() => { setBookingStation(s); setBookingError(''); }}
                          className={`w-full text-xs py-2.5 justify-center rounded-xl font-bold transition-all ${
                            libre
                              ? 'btn-primary shadow-sm hover:scale-[1.01]'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {s.statut === 'MAINTENANCE' ? 'Maintenance' : s.placesLibres > 0 ? 'Réserver' : 'Complet'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── CLIENT: HISTORY */}
            {tab === 'history' && (
              <div className="card p-6 shadow-sm border-slate-100 bg-white">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Historique des prestations</h2>
                {washes.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="text-slate-200 mx-auto mb-4"/>
                    <p className="text-slate-400 font-semibold">Aucun historique pour le moment.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Service</th>
                          <th className="pb-3">Station</th>
                          <th className="pb-3 text-right">Prix</th>
                          <th className="pb-3 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {washes.map((w:any) => (
                          <tr key={w.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 text-slate-500">{formatDate(w.createdAt)}</td>
                            <td className="py-4 font-bold text-slate-800">{w.service?.nom}</td>
                            <td className="py-4 text-slate-500">{w.station?.nom}</td>
                            <td className="py-4 text-right font-bold text-slate-800">{fcfa(w.prixPaye)}</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                                {w.statut === 'COMPLETED' && !w.review && (
                                  <button onClick={() => { setReviewWash(w); setReviewError(''); }} className="text-xs text-blue-600 hover:text-white font-bold border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-600 transition-all shrink-0">Laisser un avis</button>
                                )}
                                {w.statut === 'COMPLETED' && w.review && (
                                  <span className="text-xs text-slate-400 italic shrink-0">Avis laissé</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── ADMIN DASHBOARD VIEW ────────────────────────────────── */}
        {!isClient && (
          <>
            {/* ── ADMIN: OVERVIEW */}
            {tab === 'admin_overview' && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { icon: CalendarCheck, label: 'Réservations globales', value: data.totalReservations, color: 'bg-blue-50 text-blue-700 border border-blue-100' },
                    { icon: Droplets,      label: 'Lavages terminés',     value: data.totalWashes,       color: 'bg-green-50 text-green-700 border border-green-100' },
                    { icon: DollarSign,    label: 'Revenus totaux',       value: fcfa(data.totalRevenus || 0), color: 'bg-purple-50 text-purple-700 border border-purple-100' },
                    { icon: MapPin,        label: 'Stations gérées',      value: stations.length,        color: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className={`card p-5 flex items-center gap-4 bg-white shadow-sm hover:scale-[1.01] transition-transform`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={24}/></div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Quick Bookings Overview */}
                  <div className="card p-6 bg-white shadow-sm border-slate-100 lg:col-span-2">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2"><Clock className="text-blue-600"/> Activité récente</h3>
                    {washes.length === 0 ? (
                      <p className="text-slate-400 text-sm italic py-4">Aucune activité enregistrée.</p>
                    ) : (
                      <div className="space-y-3">
                        {washes.slice(0, 5).map((w: any) => (
                          <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-2">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{w.service?.nom} · <span className="text-xs text-slate-400 font-medium">{w.station?.nom}</span></div>
                              <div className="text-xs text-slate-500 mt-0.5">Client: {w.user?.prenom} {w.user?.nom} ({w.user?.email})</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(w.createdAt)}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                              {w.statut === 'PENDING' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateWashStatus(w.id, 'IN_PROGRESS')}
                                  className="text-[11px] bg-blue-900 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-950 transition-all shadow-sm"
                                >
                                  Accepter
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setTab('admin_reservations')} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 mt-4">
                          Voir toutes les réservations <ChevronRight size={14}/>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats Summary */}
                  <div className="card p-6 bg-white shadow-sm border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2"><Settings className="text-blue-600"/> Raccourcis</h3>
                    <div className="space-y-3">
                      <button onClick={() => { setEditingStation(null); setShowAddStation(true); }} className="w-full btn-outline text-sm py-3 px-4 flex items-center justify-center gap-2 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-900 hover:text-white transition-all font-bold rounded-xl">
                        <Plus size={16}/> Ajouter une station
                      </button>
                      <button onClick={() => { setEditingService(null); setShowAddService(true); }} className="w-full btn-outline text-sm py-3 px-4 flex items-center justify-center gap-2 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-900 hover:text-white transition-all font-bold rounded-xl">
                        <Plus size={16}/> Ajouter un service
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADMIN: RESERVATIONS */}
            {tab === 'admin_reservations' && (
              <div className="card p-6 bg-white shadow-sm border-slate-100">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Gestion des réservations</h2>
                {washes.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarCheck size={48} className="text-slate-200 mx-auto mb-4"/>
                    <p className="text-slate-400 font-semibold">Aucune réservation dans le système.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                          <th className="pb-3">Client</th>
                          <th className="pb-3">Service</th>
                          <th className="pb-3">Station</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3 text-right">Prix</th>
                          <th className="pb-3 text-center">Statut</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {washes.map((w: any) => (
                          <tr key={w.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4">
                              <div className="font-bold text-slate-800">{w.user?.prenom} {w.user?.nom}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{w.user?.email}</div>
                            </td>
                            <td className="py-4 font-semibold text-slate-800">{w.service?.nom}</td>
                            <td className="py-4 text-slate-500">{w.station?.nom}</td>
                            <td className="py-4 text-slate-500 text-xs">{formatDate(w.createdAt)}</td>
                            <td className="py-4 text-right font-bold text-slate-800">{fcfa(w.prixPaye)}</td>
                            <td className="py-4 text-center">
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {w.statut === 'PENDING' && (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'IN_PROGRESS')}
                                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 transition-all"
                                    >
                                      Accepter
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'CANCELLED')}
                                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded shadow-sm border border-red-200 flex items-center gap-1 transition-all"
                                    >
                                      Refuser
                                    </button>
                                  </>
                                )}
                                {w.statut === 'IN_PROGRESS' && (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'COMPLETED')}
                                      className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 transition-all"
                                    >
                                      Terminer
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'CANCELLED')}
                                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded shadow-sm border border-red-200 flex items-center gap-1 transition-all"
                                    >
                                      Annuler
                                    </button>
                                  </>
                                )}
                                {['COMPLETED', 'CANCELLED'].includes(w.statut) && (
                                  <span className="text-xs text-slate-400 italic">Prestation close</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── ADMIN: STATIONS */}
            {tab === 'admin_stations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="font-bold text-slate-900 text-xl">Gestion des stations de lavage</h2>
                  <button onClick={() => {
                    setEditingStation(null);
                    setStationForm({
                      nom: '', quartier: '', adresse: '', latitude: 4.05, longitude: 9.7,
                      heureOuverture: '06:00', heureFermeture: '22:00', totalPlaces: 3, placesLibres: 3, statut: 'ACTIVE'
                    });
                    setShowAddStation(true);
                  }} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 shadow-sm hover:scale-[1.01] transition-transform">
                    <Plus size={16}/> Ajouter une station
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stations.map((s: any) => (
                    <div key={s.id} className="card p-5 bg-white shadow-sm border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{s.nom}</h3>
                            <p className="text-slate-400 text-xs mt-0.5">{s.adresse} ({s.quartier})</p>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            s.statut === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                            s.statut === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {s.statut === 'ACTIVE' ? 'Actif' : s.statut === 'MAINTENANCE' ? 'Maintenance' : 'Fermée'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1 mb-4">
                          <div className="flex items-center gap-1"><Clock size={12} className="text-slate-400"/> Horaires : {s.heureOuverture} – {s.heureFermeture}</div>
                          <div className="flex items-center gap-1"><Truck size={12} className="text-slate-400"/> Places : {s.totalPlaces - s.placesLibres} occupées sur {s.totalPlaces} ({s.placesLibres} libres)</div>
                        </div>
                      </div>
                      <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                        <button
                          onClick={() => {
                            setEditingStation(s)
                            setStationForm({
                              nom: s.nom, quartier: s.quartier, adresse: s.adresse, latitude: s.latitude, longitude: s.longitude,
                              heureOuverture: s.heureOuverture, heureFermeture: s.heureFermeture, totalPlaces: s.totalPlaces, placesLibres: s.placesLibres, statut: s.statut
                            })
                            setShowAddStation(true)
                          }}
                          className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Edit2 size={12}/> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteStation(s.id)}
                          className="py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ADMIN: SERVICES */}
            {tab === 'admin_services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="font-bold text-slate-900 text-xl">Gestion des services et tarifs</h2>
                  <button onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      nom: '', description: '', prixFcfa: 10000, durationMinutes: 45, icon: 'Droplets', active: true
                    });
                    setShowAddService(true);
                  }} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 shadow-sm hover:scale-[1.01] transition-transform">
                    <Plus size={16}/> Ajouter un service
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((s: any) => (
                    <div key={s.id} className="card p-5 bg-white shadow-sm border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{s.nom}</h3>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{s.description}</p>
                          </div>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                            s.active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {s.active ? 'Actif' : 'Masqué'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1 mb-4">
                          <div className="font-extrabold text-blue-900 text-base">{fcfa(s.prixFcfa)}</div>
                          <div className="flex items-center gap-1"><Clock size={12} className="text-slate-400"/> Durée : {s.durationMinutes} min</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">Icône : {s.icon}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                        <button
                          onClick={() => {
                            setEditingService(s)
                            setServiceForm({
                              nom: s.nom, description: s.description, prixFcfa: s.prixFcfa, durationMinutes: s.durationMinutes, icon: s.icon, active: s.active
                            })
                            setShowAddService(true)
                          }}
                          className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Edit2 size={12}/> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ADMIN: CLIENTS */}
            {tab === 'admin_clients' && data.clients && (
              <div className="card p-6 bg-white shadow-sm border-slate-100">
                <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2"><Users className="text-blue-600"/> Liste des clients enregistrés</h2>
                {data.clients.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Aucun client enregistré.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                          <th className="pb-3">Nom Complet</th>
                          <th className="pb-3">E-mail</th>
                          <th className="pb-3">Téléphone</th>
                          <th className="pb-3 text-center">Lavages effectués</th>
                          <th className="pb-3 text-center">Points fidélité</th>
                          <th className="pb-3 text-right">Date d'inscription</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.clients.map((c: any) => (
                          <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 font-bold text-slate-800">{c.prenom} {c.nom}</td>
                            <td className="py-4 text-slate-600 font-medium">{c.email}</td>
                            <td className="py-4 text-slate-500">{c.telephone || 'Non renseigné'}</td>
                            <td className="py-4 text-center font-bold text-slate-800">{c.totalWashes}</td>
                            <td className="py-4 text-center text-yellow-600 font-extrabold flex items-center justify-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-500"/> {c.loyaltyPoints}
                            </td>
                            <td className="py-4 text-right text-slate-400 text-xs">{formatDate(c.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── ADMIN: REVIEWS (TESTIMONIALS) */}
            {tab === 'admin_reviews' && (
              <div className="card p-6 bg-white shadow-sm border-slate-100">
                <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2"><MessageSquare className="text-blue-600"/> Témoignages et avis clients</h2>
                {/* We load reviews via client fetch but admin has access to reviews data in db */}
                <AdminReviewsList actionLoading={actionLoading} onDeleteReview={handleDeleteReview}/>
              </div>
            )}
          </>
        )}

      </div>
      
      {/* ── CLIENT MODALS ───────────────────────────────────────── */}
      {/* Booking Modal */}
      {bookingStation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 transform scale-100 transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Réserver à {bookingStation.nom}</h3>
            <p className="text-slate-500 text-sm mb-6">{bookingStation.adresse}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Choisir un service *</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom} ({fcfa(s.prixFcfa)})</option>
                  ))}
                </select>
              </div>
              
              {selectedServiceId > 0 && (
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50/50">
                  <div className="text-xs text-blue-700 font-bold mb-1">Détails du service sélectionné</div>
                  <div className="text-sm text-slate-600">{services.find(s => s.id === selectedServiceId)?.description}</div>
                  <div className="text-xs text-slate-400 mt-2">Durée estimée : {services.find(s => s.id === selectedServiceId)?.durationMinutes} minutes</div>
                </div>
              )}
              
              {bookingError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium">{bookingError}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                disabled={isBooking}
                onClick={() => setBookingStation(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
              >
                Annuler
              </button>
              <button
                disabled={isBooking}
                onClick={handleBook}
                className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {isBooking && <Loader2 size={16} className="animate-spin"/>}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewWash && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Votre avis sur votre lavage</h3>
            <p className="text-slate-500 text-sm mb-6">{reviewWash.service?.nom} · {reviewWash.station?.nom}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Note (Étoiles)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none transition-transform active:scale-90"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= reviewRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-200'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Commentaire</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience (qualité, accueil...)"
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              
              {reviewError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium">{reviewError}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                disabled={isReviewing}
                onClick={() => setReviewWash(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
              >
                Annuler
              </button>
              <button
                disabled={isReviewing || !reviewComment.trim()}
                onClick={handleReview}
                className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReviewing && <Loader2 size={16} className="animate-spin"/>}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN MODALS ────────────────────────────────────────── */}
      {/* Station Create/Edit Modal */}
      {showAddStation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {editingStation ? `Modifier la station ${editingStation.nom}` : 'Ajouter une nouvelle station de lavage'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">Renseignez les informations de la station de Douala.</p>
            
            <form onSubmit={handleStationSubmit} className="space-y-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom de la station *</label>
                  <input
                    required
                    value={stationForm.nom}
                    onChange={(e) => setStationForm({ ...stationForm, nom: e.target.value })}
                    placeholder="Station Deido"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Quartier *</label>
                  <input
                    required
                    value={stationForm.quartier}
                    onChange={(e) => setStationForm({ ...stationForm, quartier: e.target.value })}
                    placeholder="Deido"
                    className="input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Adresse Complète *</label>
                <input
                  required
                  value={stationForm.adresse}
                  onChange={(e) => setStationForm({ ...stationForm, adresse: e.target.value })}
                  placeholder="Boulevard de la Liberté, Deido, Douala"
                  className="input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={stationForm.latitude}
                    onChange={(e) => setStationForm({ ...stationForm, latitude: Number(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={stationForm.longitude}
                    onChange={(e) => setStationForm({ ...stationForm, longitude: Number(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Heure d'ouverture</label>
                  <input
                    type="time"
                    value={stationForm.heureOuverture}
                    onChange={(e) => setStationForm({ ...stationForm, heureOuverture: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Heure de fermeture</label>
                  <input
                    type="time"
                    value={stationForm.heureFermeture}
                    onChange={(e) => setStationForm({ ...stationForm, heureFermeture: e.target.value })}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Capacité Max *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={3}
                    value={stationForm.totalPlaces}
                    onChange={(e) => setStationForm({ ...stationForm, totalPlaces: Number(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Places Libres *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={stationForm.totalPlaces}
                    value={stationForm.placesLibres}
                    onChange={(e) => setStationForm({ ...stationForm, placesLibres: Number(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Statut *</label>
                  <select
                    value={stationForm.statut}
                    onChange={(e) => setStationForm({ ...stationForm, statut: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="ACTIVE">Actif (Libre)</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="FERMEE">Fermée</option>
                  </select>
                </div>
              </div>

              {actionError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium">{actionError}</div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowAddStation(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin"/>}
                  {editingStation ? 'Mettre à jour' : 'Créer la station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Create/Edit Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {editingService ? `Modifier le service ${editingService.nom}` : 'Ajouter un service de lavage'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">Définissez les options et le tarif de la prestation.</p>
            
            <form onSubmit={handleServiceSubmit} className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom du service *</label>
                <input
                  required
                  value={serviceForm.nom}
                  onChange={(e) => setServiceForm({ ...serviceForm, nom: e.target.value })}
                  placeholder="Lavage Express"
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Formule rapide de lavage en 30 minutes..."
                  className="input text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tarif (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceForm.prixFcfa}
                    onChange={(e) => setServiceForm({ ...serviceForm, prixFcfa: Number(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Durée (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Icône Lucide</label>
                  <select
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="Droplets">Gouttes (Droplets)</option>
                    <option value="Zap">Éclair (Zap)</option>
                    <option value="Settings">Moteur (Settings)</option>
                    <option value="ShieldCheck">Bouclier (ShieldCheck)</option>
                    <option value="Leaf">Feuille (Leaf)</option>
                    <option value="Truck">Camion (Truck)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, active: !serviceForm.active })}
                    className="text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    {serviceForm.active ? <ToggleRight className="text-green-600" size={36}/> : <ToggleLeft className="text-slate-300" size={36}/>}
                  </button>
                  <span className="text-xs font-semibold text-slate-600">Service actif</span>
                </div>
              </div>

              {actionError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium">{actionError}</div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowAddService(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin"/>}
                  {editingService ? 'Mettre à jour' : 'Créer le service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Subcomponent to load and manage reviews inside Admin Tab
function AdminReviewsList({ actionLoading, onDeleteReview }: { actionLoading: boolean, onDeleteReview: (id: number) => void }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [actionLoading]) // Reload reviews when an action finishes

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28}/></div>

  if (reviews.length === 0) return <p className="text-slate-400 text-sm italic py-4">Aucun avis laissé par les clients.</p>

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {reviews.map((r: any) => (
        <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-slate-800 text-sm">{r.nom}</div>
                <div className="text-[10px] text-slate-400">{r.poste}</div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={`text-yellow-400 ${i < r.rating ? 'fill-yellow-400' : 'text-slate-200'}`}/>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed mb-4">"{r.texte}"</p>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
            <span className="text-[9px] text-slate-400">{r.createdAt ? formatDate(r.createdAt) : ''}</span>
            <button
              disabled={actionLoading}
              onClick={() => onDeleteReview(r.id)}
              className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 size={13}/> Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
