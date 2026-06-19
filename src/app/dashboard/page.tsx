/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Truck, CalendarCheck, Star, Gift, MapPin, History,
  LogOut, Droplets, Loader2, CheckCircle2, Clock, ChevronRight, Trophy,
  Plus, Edit2, Trash2, CheckCircle, XCircle, Shield, DollarSign, Users,
  MessageSquare, ToggleLeft, ToggleRight, Settings, Sparkles, Award, CreditCard, RefreshCw
} from 'lucide-react'
import { fcfa, formatDate } from '@/lib/format'
import { jsPDF } from 'jspdf'

interface DashData {
  user: { nom: string; prenom: string; email: string; loyaltyPoints: number; totalWashes: number; role: string }
  washes: any[]
  vouchers?: any[]
  clients?: any[]
  stations?: any[]
  services?: any[]
  totalWashes: number
  totalReservations: number
  totalRevenus?: number
  loyalty?: { next: number; progress: number; remaining: number }
  vehicles?: any[]
  transactions?: any[]
  wallet?: { solde: number }
}

const STATUT_BADGE: Record<string, string> = {
  PENDING_VALIDATION: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-800 border border-blue-200',
  VEHICLE_DEPOSITED: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  WASHING: 'bg-sky-100 text-sky-800 border border-sky-200',
  READY: 'bg-purple-100 text-purple-800 border border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border border-red-200',
}

const STATUT_LABEL: Record<string, string> = {
  PENDING_VALIDATION: 'En attente de validation',
  ACCEPTED: 'Acceptée',
  VEHICLE_DEPOSITED: 'Véhicule déposé',
  WASHING: 'En cours de lavage',
  READY: 'Prêt à être récupéré',
  COMPLETED: 'Terminée',
  REJECTED: 'Refusée',
}

const generatePDFReceipt = (wash: any, fallbackUser?: any) => {
  const doc = new jsPDF()

  // Colors & Styles
  doc.setFillColor(30, 58, 138) // RGB for #1e3a8a (Navy)
  doc.rect(0, 0, 210, 40, 'F')

  // Header Title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('LAVERIEPRO DOUALA', 15, 25)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Reçu de paiement & de prestation', 145, 25)

  // Receipt Details Card
  doc.setFillColor(248, 250, 252) // slate-50
  doc.rect(15, 50, 180, 25, 'F')

  const receiptNum = `REC-${new Date(wash.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${wash.id}`

  doc.setTextColor(30, 58, 138)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('RÉFÉRENCE DE REÇU :', 20, 60)
  doc.text('STATUT :', 120, 60)

  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.text(receiptNum, 20, 68)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 101, 52) // Green
  doc.text('PAYÉ (WALLET)', 120, 68)

  // Client & Station Columns
  doc.setTextColor(30, 58, 138)
  doc.setFontSize(11)
  doc.text('INFORMATIONS CLIENT', 15, 90)
  doc.text('STATION DE LAVAGE', 110, 90)

  // Divider
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.line(15, 93, 195, 93)

  const clientUser = wash.user || fallbackUser
  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Nom : ${clientUser?.prenom || ''} ${clientUser?.nom || ''}`.trim() || 'Nom : Client', 15, 100)
  doc.text(`Email : ${clientUser?.email || 'N/A'}`, 15, 107)
  doc.text(`Téléphone : ${clientUser?.telephone || 'N/A'}`, 15, 114)

  doc.text(`Nom : ${wash.station?.nom || ''}`, 110, 100)
  doc.text(`Adresse : ${wash.station?.adresse || ''}`, 110, 107)
  doc.text(`Quartier : ${wash.station?.quartier || ''}`, 110, 114)

  // Vehicle Details
  doc.setTextColor(30, 58, 138)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('VÉHICULE CONCERNÉ', 15, 130)

  doc.line(15, 133, 195, 133)

  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Matricule : ${wash.vehicle?.matricule || ''}`, 15, 140)
  doc.text(`Marque / Modèle : ${wash.vehicle?.marque || ''} ${wash.vehicle?.modele || ''}`, 15, 147)
  doc.text(`Type : ${wash.vehicle?.type || ''}`, 110, 140)
  doc.text(`Couleur : ${wash.vehicle?.couleur || 'N/A'}`, 110, 147)

  // Service Details Table Header
  doc.setFillColor(30, 58, 138)
  doc.rect(15, 160, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('DESCRIPTION DU SERVICE', 20, 166)
  doc.text('MONTANT', 160, 166)

  // Service Row
  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.text(wash.service?.nom || 'Lavage Poids Lourds', 20, 178)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138)
  doc.text(`${wash.prixPaye.toLocaleString('fr-FR')} FCFA`, 160, 178)

  doc.setDrawColor(226, 232, 240)
  doc.line(15, 183, 195, 183)

  // Total
  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Payé :', 130, 193)
  doc.setTextColor(22, 101, 52)
  doc.setFontSize(12)
  doc.text(`${wash.prixPaye.toLocaleString('fr-FR')} FCFA`, 160, 193)

  // Dates
  doc.setTextColor(71, 85, 105)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const scheduledDate = wash.startTime ? new Date(wash.startTime).toLocaleString('fr-FR') : 'N/A'
  const realEndDate = wash.endTime ? new Date(wash.endTime).toLocaleString('fr-FR') : new Date(wash.createdAt).toLocaleString('fr-FR')
  doc.text(`Date de réservation planifiée : ${scheduledDate}`, 15, 215)
  doc.text(`Date de fin de service : ${realEndDate}`, 15, 222)
  doc.text(`Date d'émission du reçu : ${new Date().toLocaleString('fr-FR')}`, 15, 229)

  // Footer note
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Merci pour votre confiance. LaveriePro Douala - Service Client +237 6 XX XX XX XX', 15, 260)

  // Save PDF
  doc.save(`recu-${receiptNum}.pdf`)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<string>('overview')
  const [stations, setStations] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  // Client Vehicle CRUD States
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [vehicleForm, setVehicleForm] = useState({
    matricule: '', marque: '', modele: '', type: 'Tracteur routier', couleur: '', infos: ''
  })

  // Client Wallet Recharge States
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeForm, setRechargeForm] = useState({
    montant: '', moyenPaiement: 'ORANGE_MONEY', simulateFail: false
  })
  const [isRecharging, setIsRecharging] = useState(false)
  const [rechargeError, setRechargeError] = useState('')
  const [rechargeSuccess, setRechargeSuccess] = useState('')

  // Client Booking States
  const [bookingStation, setBookingStation] = useState<any>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0)
  const [bookingVehicleId, setBookingVehicleId] = useState<number>(0)
  const [bookingDate, setBookingDate] = useState<string>('')
  const [bookingTime, setBookingTime] = useState<string>('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [confirmedEarlyWashes, setConfirmedEarlyWashes] = useState<Record<number, boolean>>({})

  // Client Review States
  const [reviewWash, setReviewWash] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Admin CRUD States (Stations & Services)
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
  const [reassignWash, setReassignWash] = useState<any>(null)
  const [selectedNewStationId, setSelectedNewStationId] = useState<number>(0)

  const router = useRouter()

  const refreshData = () => {
    const token = localStorage.getItem('token')
    if (!token) return
    Promise.all([
      fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
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
      
      // Auto-set first service if none selected
      if (svcs.length > 0 && selectedServiceId === 0) {
        setSelectedServiceId(svcs[0].id)
      }
      // Auto-set first vehicle for booking if available
      if (dash.vehicles && dash.vehicles.length > 0 && bookingVehicleId === 0) {
        setBookingVehicleId(dash.vehicles[0].id)
      }
    }).catch(err => console.error("Error refreshing dashboard:", err))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/connexion'); return }

    Promise.all([
      fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
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
      if (dash.vehicles && dash.vehicles.length > 0) setBookingVehicleId(dash.vehicles[0].id)
      
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

  // Client Vehicle CRUD Actions
  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setActionError('')
    const token = localStorage.getItem('token')
    const method = editingVehicle ? 'PUT' : 'POST'
    const body = editingVehicle ? { id: editingVehicle.id, ...vehicleForm } : vehicleForm

    try {
      const res = await fetch('/api/vehicles', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json()
        setActionError(err.message || 'Erreur lors de l\'enregistrement du véhicule.')
      } else {
        setShowAddVehicle(false)
        setEditingVehicle(null)
        setVehicleForm({ matricule: '', marque: '', modele: '', type: 'Tracteur routier', couleur: '', infos: '' })
        refreshData()
      }
    } catch {
      setActionError('Erreur de connexion réseau.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Voulez-vous supprimer ce véhicule ? Ses réservations associées seront également supprimées.')) return
    setActionLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, {
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

  // Client Wallet Recharge Action
  const handleRechargeWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRecharging(true)
    setRechargeError('')
    setRechargeSuccess('')
    const token = localStorage.getItem('token')

    try {
      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(rechargeForm)
      })
      const result = await res.json()

      if (!res.ok) {
        setRechargeError(result.message || 'La transaction a échoué.')
      } else {
        setRechargeSuccess(result.message || 'Recharge réussie !')
        setRechargeForm({ montant: '', moyenPaiement: 'ORANGE_MONEY', simulateFail: false })
        setTimeout(() => {
          setShowRechargeModal(false)
          setRechargeSuccess('')
          refreshData()
        }, 1500)
      }
    } catch {
      setRechargeError('Erreur de connexion avec le service de paiement.')
    } finally {
      setIsRecharging(false)
    }
  }

  // Client Booking Action
  const handleBook = async () => {
    if (!selectedServiceId || !bookingStation || !bookingVehicleId || !bookingDate || !bookingTime) {
      setBookingError('Veuillez remplir tous les champs obligatoires (véhicule, date et heure).')
      return
    }
    setIsBooking(true)
    setBookingError('')
    const token = localStorage.getItem('token')
    const startDateTime = new Date(`${bookingDate}T${bookingTime}`)

    try {
      const res = await fetch('/api/washes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          stationId: bookingStation.id,
          vehicleId: bookingVehicleId,
          startTime: startDateTime.toISOString()
        })
      })
      const result = await res.json()
      if (!res.ok) {
        setBookingError(result.message || 'Une erreur est survenue.')
      } else {
        setBookingStation(null)
        setBookingVehicleId(data?.vehicles && data.vehicles.length > 0 ? data.vehicles[0].id : 0)
        setBookingDate('')
        setBookingTime('')
        refreshData()
      }
    } catch {
      setBookingError('Erreur de connexion.')
    } finally {
      setIsBooking(false)
    }
  }

  // Client Review Action
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

  const handleAcceptClick = (wash: any) => {
    const station = stations.find(s => s.id === wash.stationId)
    if (station && station.placesLibres <= 0) {
      setReassignWash(wash)
      const available = stations.find(s => s.statut === 'ACTIVE' && s.placesLibres > 0)
      if (available) {
        setSelectedNewStationId(available.id)
      } else {
        setSelectedNewStationId(0)
      }
    } else {
      handleUpdateWashStatus(wash.id, 'ACCEPTED')
    }
  }

  const handleReassignAndAccept = async (washId: number, newStationId: number) => {
    setActionLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/washes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: washId, statut: 'ACCEPTED', stationId: newStationId })
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Erreur lors de la réaffectation.')
      } else {
        setReassignWash(null)
        setSelectedNewStationId(0)
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-700" size={40} />
    </div>
  )

  if (!data) return null
  const { user, washes, totalWashes, totalReservations } = data

  const isClient = user.role !== 'ADMIN'

  // Admin Navigation Tabs
  const ADMIN_TABS = [
    { id: 'admin_overview',     label: 'Tableau de bord',   icon: Shield },
    { id: 'admin_reservations', label: 'Réservations',      icon: CalendarCheck },
    { id: 'admin_stations',     label: 'Stations',          icon: MapPin },
    { id: 'admin_services',     label: 'Services & Tarifs', icon: Settings },
    { id: 'admin_clients',      label: 'Clients & Wallets', icon: Users },
    { id: 'admin_transactions', label: 'Flux Financiers',   icon: DollarSign },
    { id: 'admin_reviews',      label: 'Témoignages',       icon: MessageSquare },
  ]

  // Client Navigation Tabs
  const CLIENT_TABS = [
    { id: 'overview',     label: 'Accueil',        icon: Droplets },
    { id: 'reservations', label: 'Réservations',   icon: CalendarCheck },
    { id: 'vehicles',     label: 'Mes véhicules',  icon: Truck },
    { id: 'wallet',       label: 'Mon Wallet',     icon: DollarSign },
    { id: 'vouchers',     label: 'Mes bons',       icon: Gift },
    { id: 'stations',     label: 'Stations',       icon: MapPin },
    { id: 'history',      label: 'Historique',     icon: History },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Bonjour, {user.prenom} {user.nom} 👋
              {user.role === 'ADMIN' && <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider shrink-0 shadow-sm">Admin</span>}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {user.role === 'ADMIN' ? 'Espace de gestion et d\'administration de Laverie Poids Lourds.' : 'Prêt pour faire briller votre poids lourd aujourd\'hui ?'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link href="/rapports" className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5 bg-white shadow-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                <Shield size={14} className="text-blue-500" /> Rapports Généraux
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors font-medium">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-200 no-scrollbar">
          {(isClient ? CLIENT_TABS : ADMIN_TABS).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                tab === id
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/70'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ── CLIENT DASHBOARD VIEW ───────────────────────────────── */}
        {isClient && (
          <>
            {/* ── CLIENT: OVERVIEW */}
            {tab === 'overview' && data.loyalty && (
              <div className="space-y-6">
                {/* Notification: Lavage terminé (READY) */}
                {washes.filter((w: any) => w.statut === 'READY').map((w: any) => (
                  <div key={w.id} className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} className="animate-bounce" />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-950 text-sm">Votre lavage est terminé !</h4>
                        <p className="text-xs text-purple-800 mt-0.5">Votre véhicule <span className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border">{w.vehicle?.matricule}</span> est prêt à être récupéré à la <strong>{w.station?.nom}</strong>.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => generatePDFReceipt(w, data.user)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
                    >
                      Télécharger mon reçu
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: DollarSign,    label: 'Solde Wallet',     value: fcfa(data.wallet?.solde || 0), color: 'bg-blue-600 text-white shadow-md' },
                    { icon: CalendarCheck, label: 'Réservations',     value: data.totalReservations,        color: 'bg-white text-slate-700 border border-slate-200' },
                    { icon: Star,          label: 'Points fidélité',   value: user.loyaltyPoints,             color: 'bg-white text-slate-700 border border-slate-200' },
                    { icon: Gift,          label: 'Bons disponibles',  value: data.vouchers?.length || 0,     color: 'bg-white text-slate-700 border border-slate-200' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className={`card p-5 flex items-center justify-between gap-3 shadow-sm rounded-2xl ${color}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${label === 'Solde Wallet' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}><Icon size={20} /></div>
                        <div>
                          <div className={`text-xs font-medium ${label === 'Solde Wallet' ? 'text-blue-100' : 'text-slate-400'}`}>{label}</div>
                          <div className="text-xl md:text-2xl font-extrabold mt-0.5">{value}</div>
                        </div>
                      </div>
                      {label === 'Solde Wallet' && (
                        <button onClick={() => setTab('wallet')} className="text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 py-1.5 px-3 rounded-lg shadow-sm transition-all">
                          Gérer
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-6 text-slate-800 relative overflow-hidden shadow-lg border border-yellow-200 animate-fadeIn" style={{ background: 'linear-gradient(135deg, #FFD700, #FDB931)' }}>
                  <div className="absolute right-4 bottom-2 text-9xl opacity-10">👑</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={22} className="text-yellow-800" />
                    <h3 className="font-bold text-lg text-yellow-900">Programme Fidélité</h3>
                  </div>
                  <p className="text-yellow-900 text-sm mb-4">
                    {data.loyalty.remaining > 0
                      ? `Encore ${data.loyalty.remaining} lavage${data.loyalty.remaining > 1 ? 's' : ''} pour atteindre le prochain palier (${data.loyalty.next} lavages)`
                      : 'Félicitations ! Vous avez atteint un palier 🎉'}
                  </p>
                  <div className="bg-white/30 rounded-full h-3 overflow-hidden mb-2">
                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${data.loyalty.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-yellow-900 font-semibold">
                    <span>{user.totalWashes} lavages effectués</span>
                    <span>Prochain palier : {data.loyalty.next}</span>
                  </div>
                </div>

                <div className="card p-6 shadow-sm border-slate-100 bg-white">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><History size={18} className="text-blue-500" /> Vos réservations récentes</h3>
                  {washes.length === 0
                    ? <p className="text-slate-400 text-sm italic py-4">Aucun lavage pour le moment.</p>
                    : washes.slice(0, 5).map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{w.service?.nom}</div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span>{w.station?.nom}</span>
                            <span>•</span>
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{w.vehicle?.matricule}</span>
                            <span>•</span>
                            <span>Planifié le : {w.startTime ? formatDate(w.startTime) : 'Non planifié'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-slate-800">{fcfa(w.prixPaye)}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
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
                {washes.filter((w: any) => w.statut !== 'COMPLETED' && w.statut !== 'REJECTED').length === 0
                  ? (
                    <div className="text-center py-12">
                      <CalendarCheck size={48} className="text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">Aucune réservation en cours.</p>
                      <button onClick={() => setTab('stations')} className="btn-primary text-sm py-2.5 px-5">Réserver une station</button>
                    </div>
                  ) : washes.filter((w: any) => !['COMPLETED', 'REJECTED'].includes(w.statut)).map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 mb-3 hover:bg-slate-100/50 transition-all">
                      <div>
                        <div className="font-bold text-slate-800">{w.service?.nom}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{w.station?.nom} · {w.station?.adresse}</div>
                        <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
                          <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">{w.vehicle?.matricule} ({w.vehicle?.marque})</span>
                          <span>•</span>
                          <span>Planifié le : {w.startTime ? formatDate(w.startTime) : 'Non planifié'} (Créé le : {formatDate(w.createdAt)})</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* ── CLIENT: VEHICLES */}
            {tab === 'vehicles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-xl">Mes véhicules</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Enregistrez et gérez vos camions pour vos réservations.</p>
                  </div>
                  <button onClick={() => { setEditingVehicle(null); setVehicleForm({ matricule: '', marque: '', modele: '', type: 'Tracteur routier', couleur: '', infos: '' }); setShowAddVehicle(true); }} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 shadow-sm hover:scale-[1.01] transition-transform">
                    <Plus size={16} /> Ajouter un véhicule
                  </button>
                </div>

                {!data.vehicles || data.vehicles.length === 0 ? (
                  <div className="card p-12 text-center bg-white shadow-sm rounded-2xl">
                    <Truck size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4 font-medium">Aucun véhicule enregistré.</p>
                    <button onClick={() => setShowAddVehicle(true)} className="btn-primary text-xs py-2 px-4">Ajouter mon premier camion</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {data.vehicles.map((v: any) => (
                      <div key={v.id} className="card p-5 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col justify-between hover:border-slate-200 transition-all">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="font-mono text-base font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 inline-block tracking-wider">
                                {v.matricule}
                              </span>
                              <h3 className="font-bold text-slate-900 mt-2">{v.marque} <span className="text-slate-500 text-sm font-semibold">{v.modele || ''}</span></h3>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                              {v.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 space-y-1.5 mt-4">
                            {v.couleur && <div><span className="font-medium text-slate-400">Couleur :</span> {v.couleur}</div>}
                            {v.infos && <div className="italic text-slate-400">"{v.infos}"</div>}
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-100 pt-4 mt-5">
                          <button
                            onClick={() => {
                              setEditingVehicle(v)
                              setVehicleForm({
                                matricule: v.matricule, marque: v.marque, modele: v.modele || '',
                                type: v.type, couleur: v.couleur || '', infos: v.infos || ''
                              })
                              setShowAddVehicle(true)
                            }}
                            className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                          >
                            <Edit2 size={12} /> Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(v.id)}
                            className="py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CLIENT: WALLET */}
            {tab === 'wallet' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                  {/* Card Solde */}
                  <div className="flex-1 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-blue-900 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-between">
                    <div className="absolute right-4 bottom-2 text-9xl opacity-5"><CreditCard /></div>
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Mon Portefeuille</span>
                        <span className="text-xs font-semibold bg-blue-600 text-white py-1 px-2.5 rounded-full">Sécurisé</span>
                      </div>
                      <div className="text-slate-400 text-xs">Solde disponible</div>
                      <div className="text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-white">{fcfa(data.wallet?.solde || 0)}</div>
                    </div>
                    <button onClick={() => { setRechargeError(''); setRechargeSuccess(''); setShowRechargeModal(true); }} className="mt-8 w-full bg-white hover:bg-blue-50 text-blue-950 font-bold py-3.5 px-5 rounded-2xl shadow-lg transition-all text-center flex items-center justify-center gap-2">
                      <Plus size={16} /> Recharger mon Wallet
                    </button>
                  </div>

                  {/* Quick Payment Mocks */}
                  <div className="card p-6 bg-white shadow-sm border border-slate-100 rounded-3xl flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base mb-2">Méthodes de recharge supportées</h3>
                      <p className="text-slate-400 text-xs mb-4">Créditez instantanément votre compte pour vos réservations.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Orange Money', 'MTN Mobile Money', 'Carte Bancaire Visa', 'Mastercard'].map(p => (
                          <div key={p} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-center text-xs font-bold text-slate-700">
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      ℹ️ Le débit de la prestation s'effectue uniquement lorsque l'administrateur **accepte** votre réservation. En cas de refus, aucun frais n'est prélevé.
                    </div>
                  </div>
                </div>

                {/* Historique Transaction */}
                <div className="card p-6 shadow-sm border-slate-100 bg-white rounded-3xl">
                  <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <History size={18} className="text-blue-500" /> Historique de rechargements et débits
                  </h3>
                  {!data.transactions || data.transactions.length === 0 ? (
                    <p className="text-slate-400 text-sm italic py-4">Aucune transaction enregistrée.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Méthode</th>
                            <th className="pb-3 text-right">Montant</th>
                            <th className="pb-3 text-right">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.transactions.map((t: any) => (
                            <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 text-slate-500 text-xs">{formatDate(t.createdAt)}</td>
                              <td className="py-3.5">
                                <span className={`font-semibold text-xs py-0.5 px-2 rounded-full ${t.type === 'RECHARGE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                  {t.type === 'RECHARGE' ? 'Recharge' : 'Lavage (Débit)'}
                                </span>
                              </td>
                              <td className="py-3.5 font-medium text-slate-600 text-xs">{t.moyenPaiement}</td>
                              <td className={`py-3.5 text-right font-extrabold ${t.montant > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                                {t.montant > 0 ? `+${fcfa(t.montant)}` : fcfa(t.montant)}
                              </td>
                              <td className="py-3.5 text-right">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.statut === 'REUSSIE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                  {t.statut === 'REUSSIE' ? 'Réussie' : 'Échouée'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── CLIENT: VOUCHERS */}
            {tab === 'vouchers' && data.vouchers && (
              <div className="card p-6 shadow-sm border-slate-100 bg-white">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Mes bons de réduction</h2>
                {data.vouchers.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Aucun bon disponible pour le moment.</p>
                    <p className="text-slate-300 text-sm">Continuez à réserver pour débloquer vos récompenses fidélité !</p>
                  </div>
                ) : data.vouchers.map((v: any) => (
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
                  {stations.map((s: any) => {
                    const libre = s.statut === 'ACTIVE' && s.placesLibres > 0
                    return (
                      <div key={s.id} className="card p-5 bg-white shadow-sm border border-slate-100 flex flex-col justify-between rounded-2xl">
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
                              {s.statut === 'MAINTENANCE' ? 'Maintenance' : s.placesLibres > 0 ? 'Disponible' : 'Occupée'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                            <Clock size={12} /> {s.heureOuverture} – {s.heureFermeture}
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
                          {s.statut === 'MAINTENANCE' ? 'Maintenance' : s.placesLibres > 0 ? 'Réserver' : 'Occupée'}
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
                    <History size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold">Aucun historique pour le moment.</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-4">
                      {washes.map((w: any) => (
                        <div key={w.id} className="card p-4 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{w.service?.nom}</div>
                              <div className="text-[10px] text-slate-400">{w.station?.nom}</div>
                            </div>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 font-semibold block">Véhicule</span>
                              <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] inline-block mt-0.5 font-bold">{w.vehicle?.matricule}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold block">Montant payé</span>
                              <span className="font-extrabold text-slate-800 mt-0.5 block">{fcfa(w.prixPaye)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 font-semibold block">Planification</span>
                              <div className="font-semibold text-slate-800 text-[11px] mt-0.5">{w.startTime ? formatDate(w.startTime) : 'Non planifié'}</div>
                              <div className="text-[9px] text-slate-400">Créé le : {formatDate(w.createdAt)}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2.5 border-t border-slate-100">
                            {(w.statut === 'READY' || w.statut === 'COMPLETED') && (
                              <button
                                onClick={() => generatePDFReceipt(w, data?.user)}
                                className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold border border-slate-200 px-2 py-1.5 rounded-lg hover:border-blue-300 transition-all shrink-0"
                              >
                                Reçu PDF
                              </button>
                            )}
                            {w.statut === 'COMPLETED' && !w.review && (
                              <button onClick={() => { setReviewWash(w); setReviewError(''); }} className="text-xs text-blue-600 hover:text-white font-bold border border-blue-200 px-2 py-1.5 rounded-lg hover:bg-blue-600 transition-all shrink-0">Laisser un avis</button>
                            )}
                            {w.statut === 'COMPLETED' && w.review && (
                              <span className="text-xs text-slate-400 italic shrink-0">Avis laissé</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm min-w-[800px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Service</th>
                            <th className="pb-3">Station</th>
                            <th className="pb-3">Véhicule</th>
                            <th className="pb-3 text-right">Prix</th>
                            <th className="pb-3 text-right">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {washes.map((w: any) => (
                            <tr key={w.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 text-slate-500">
                                <div className="font-semibold text-slate-800 text-xs">{w.startTime ? formatDate(w.startTime) : 'Non planifié'}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">Créé le : {formatDate(w.createdAt)}</div>
                              </td>
                              <td className="py-4 font-bold text-slate-800">{w.service?.nom}</td>
                              <td className="py-4 text-slate-500">{w.station?.nom}</td>
                              <td className="py-4"><span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{w.vehicle?.matricule}</span></td>
                              <td className="py-4 text-right font-bold text-slate-800">{fcfa(w.prixPaye)}</td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                                  {(w.statut === 'READY' || w.statut === 'COMPLETED') && (
                                    <button
                                      onClick={() => generatePDFReceipt(w, data?.user)}
                                      className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold border border-slate-200 px-2 py-1 rounded-lg hover:border-blue-300 transition-all shrink-0"
                                    >
                                      Télécharger Reçu
                                    </button>
                                  )}
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
                  </>
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
                    { icon: Users,         label: 'Clients',              value: new Set(data.washes.map((w: any) => w.userId)).size, color: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className={`card p-5 flex items-center gap-4 bg-white shadow-sm hover:scale-[1.01] transition-transform`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={24} /></div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Quick Bookings Overview */}
                  <div className="card p-6 bg-white shadow-sm border-slate-100 lg:col-span-2 rounded-2xl">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2"><Clock className="text-blue-600" /> Activité récente (Demandes de lavage)</h3>
                    {washes.length === 0 ? (
                      <p className="text-slate-400 text-sm italic py-4">Aucune activité enregistrée.</p>
                    ) : (
                      <div className="space-y-3">
                        {washes.slice(0, 5).map((w: any) => (
                          <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-2">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {w.service?.nom} · <span className="text-xs text-slate-400 font-medium">{w.station?.nom}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Client: {w.user?.prenom} {w.user?.nom} | Camion: <span className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border">{w.vehicle?.matricule} ({w.vehicle?.marque})</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">Planifié pour le : {w.startTime ? formatDate(w.startTime) : 'Non planifié'}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                              {w.statut === 'PENDING_VALIDATION' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleAcceptClick(w)}
                                  className="text-[11px] bg-blue-900 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-950 transition-all shadow-sm"
                                >
                                  Valider
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setTab('admin_reservations')} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 mt-4">
                          Voir et piloter les réservations <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats Summary */}
                  <div className="card p-6 bg-white shadow-sm border-slate-100 rounded-2xl">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2"><Settings className="text-blue-600" /> Raccourcis de gestion</h3>
                    <div className="space-y-3">
                      <button onClick={() => { setEditingStation(null); setShowAddStation(true); }} className="w-full btn-outline text-sm py-3 px-4 flex items-center justify-center gap-2 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-900 hover:text-white transition-all font-bold rounded-xl">
                        <Plus size={16} /> Ajouter une station
                      </button>
                      <button onClick={() => { setEditingService(null); setShowAddService(true); }} className="w-full btn-outline text-sm py-3 px-4 flex items-center justify-center gap-2 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-900 hover:text-white transition-all font-bold rounded-xl">
                        <Plus size={16} /> Ajouter un service
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADMIN: RESERVATIONS */}
            {tab === 'admin_reservations' && (
              <div className="card p-6 bg-white shadow-sm border-slate-100 rounded-2xl">
                <h2 className="font-bold text-slate-900 text-xl mb-6">Gestion administrative des réservations</h2>
                {washes.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarCheck size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold">Aucune réservation dans le système.</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-4">
                      {washes.map((w: any) => {
                        const isFuture = w.startTime ? new Date(w.startTime) > new Date() : false
                        const isChecked = !!confirmedEarlyWashes[w.id]
                        const isDisabled = isFuture && !isChecked
                        return (
                          <div key={w.id} className="card p-4 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{w.user?.prenom} {w.user?.nom}</div>
                                <div className="text-[10px] text-slate-400">{w.user?.email}</div>
                              </div>
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 font-semibold block">Service</span>
                                <span className="font-bold text-slate-800 mt-0.5 block">{w.service?.nom}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block">Station</span>
                                <span className="font-semibold text-slate-700 mt-0.5 block">{w.station?.nom}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block">Véhicule</span>
                                <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] inline-block mt-0.5 font-bold">{w.vehicle?.matricule}</span>
                                <div className="text-[9px] text-slate-400 mt-0.5">{w.vehicle?.marque} ({w.vehicle?.type})</div>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block">Montant</span>
                                <span className="font-extrabold text-slate-800 mt-0.5 block">{fcfa(w.prixPaye)}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-400 font-semibold block">Planifié le</span>
                                <div className="font-semibold text-slate-800 text-[11px] mt-0.5">{w.startTime ? formatDate(w.startTime) : 'Non planifié'}</div>
                                <div className="text-[9px] text-slate-400">Créé le : {formatDate(w.createdAt)}</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2.5 border-t border-slate-100">
                              {w.statut === 'PENDING_VALIDATION' && (
                                <>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleAcceptClick(w)}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                  >
                                    Accepter
                                  </button>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleUpdateWashStatus(w.id, 'REJECTED')}
                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg shadow-sm border border-red-200 transition-all"
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}
                              {w.statut === 'ACCEPTED' && (
                                <div className="flex flex-col items-end gap-1 w-full">
                                  {isFuture && (
                                    <label className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setConfirmedEarlyWashes(prev => ({ ...prev, [w.id]: e.target.checked }))}
                                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                                      />
                                      Camion présent en avance
                                    </label>
                                  )}
                                  <button
                                    disabled={actionLoading || isDisabled}
                                    onClick={() => handleUpdateWashStatus(w.id, 'VEHICLE_DEPOSITED')}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all w-full text-center ${
                                      isDisabled
                                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                                    title={isDisabled ? "Le créneau n'est pas encore atteint. Confirmez la présence physique." : ""}
                                  >
                                    Déposer Véhicule
                                  </button>
                                </div>
                              )}
                              {w.statut === 'VEHICLE_DEPOSITED' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateWashStatus(w.id, 'WASHING')}
                                  className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all w-full text-center"
                                >
                                  Lancer le lavage
                                </button>
                              )}
                              {w.statut === 'WASHING' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateWashStatus(w.id, 'READY')}
                                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all w-full text-center"
                                >
                                  Lavage terminé
                                </button>
                              )}
                              {(w.statut === 'READY' || w.statut === 'COMPLETED') && (
                                <button
                                  onClick={() => generatePDFReceipt(w)}
                                  className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-blue-300 transition-all shrink-0"
                                >
                                  Reçu PDF
                                </button>
                              )}
                              {w.statut === 'READY' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateWashStatus(w.id, 'COMPLETED')}
                                  className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                  Véhicule récupéré
                                </button>
                              )}
                              {['COMPLETED', 'REJECTED', 'CANCELLED'].includes(w.statut) && w.statut !== 'COMPLETED' && (
                                <span className="text-xs text-slate-400 italic">Prestation close</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm min-w-[950px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                            <th className="pb-3">Client</th>
                            <th className="pb-3">Véhicule</th>
                            <th className="pb-3">Service</th>
                            <th className="pb-3">Station</th>
                            <th className="pb-3">Date/Heure</th>
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
                              <td className="py-4">
                                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{w.vehicle?.matricule}</span>
                                <div className="text-[10px] text-slate-400 mt-0.5">{w.vehicle?.marque} ({w.vehicle?.type})</div>
                              </td>
                              <td className="py-4 font-semibold text-slate-800">{w.service?.nom}</td>
                              <td className="py-4 text-slate-500">{w.station?.nom}</td>
                              <td className="py-4 text-slate-500">
                                <div className="font-semibold text-slate-800 text-xs">{w.startTime ? formatDate(w.startTime) : 'Non planifié'}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">Créé le : {formatDate(w.createdAt)}</div>
                              </td>
                              <td className="py-4 text-right font-bold text-slate-800">{fcfa(w.prixPaye)}</td>
                              <td className="py-4 text-center">
                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${STATUT_BADGE[w.statut]}`}>{STATUT_LABEL[w.statut]}</span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {w.statut === 'PENDING_VALIDATION' && (
                                    <>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleAcceptClick(w)}
                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                      >
                                        Accepter
                                      </button>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleUpdateWashStatus(w.id, 'REJECTED')}
                                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg shadow-sm border border-red-200 transition-all"
                                      >
                                        Refuser
                                      </button>
                                    </>
                                  )}
                                  {w.statut === 'ACCEPTED' && (() => {
                                    const isFuture = w.startTime ? new Date(w.startTime) > new Date() : false
                                    const isChecked = !!confirmedEarlyWashes[w.id]
                                    const isDisabled = isFuture && !isChecked
                                    return (
                                      <div className="flex flex-col items-end gap-1">
                                        {isFuture && (
                                          <label className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => setConfirmedEarlyWashes(prev => ({ ...prev, [w.id]: e.target.checked }))}
                                              className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                                            />
                                            Camion présent en avance
                                          </label>
                                        )}
                                        <button
                                          disabled={actionLoading || isDisabled}
                                          onClick={() => handleUpdateWashStatus(w.id, 'VEHICLE_DEPOSITED')}
                                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all ${
                                            isDisabled
                                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                          }`}
                                          title={isDisabled ? "Le créneau n'est pas encore atteint. Confirmez la présence physique." : ""}
                                        >
                                          Déposer Véhicule
                                        </button>
                                      </div>
                                    )
                                  })()}
                                  {w.statut === 'VEHICLE_DEPOSITED' && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'WASHING')}
                                      className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                    >
                                      Lancer le lavage
                                    </button>
                                  )}
                                  {w.statut === 'WASHING' && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'READY')}
                                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                    >
                                      Lavage terminé
                                    </button>
                                  )}
                                  {(w.statut === 'READY' || w.statut === 'COMPLETED') && (
                                    <button
                                      onClick={() => generatePDFReceipt(w)}
                                      className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold border border-slate-200 px-2 py-1.5 rounded-lg hover:border-blue-300 transition-all shrink-0"
                                    >
                                      Télécharger Reçu
                                    </button>
                                  )}
                                  {w.statut === 'READY' && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateWashStatus(w.id, 'COMPLETED')}
                                      className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                    >
                                      Véhicule récupéré (Terminé)
                                    </button>
                                  )}
                                  {['COMPLETED', 'REJECTED', 'CANCELLED'].includes(w.statut) && w.statut !== 'COMPLETED' && (
                                    <span className="text-xs text-slate-400 italic">Prestation close</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
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
                    <Plus size={16} /> Ajouter une station
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stations.map((s: any) => (
                    <div key={s.id} className="card p-5 bg-white shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all rounded-2xl">
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
                          <div className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> Horaires : {s.heureOuverture} – {s.heureFermeture}</div>
                          <div className="flex items-center gap-1"><Truck size={12} className="text-slate-400" /> Places : {s.totalPlaces - s.placesLibres} occupées sur {s.totalPlaces} ({s.placesLibres} libres)</div>
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
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteStation(s.id)}
                          className="py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center"
                        >
                          <Trash2 size={12} />
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
                    <Plus size={16} /> Ajouter un service
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((s: any) => (
                    <div key={s.id} className="card p-5 bg-white shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all rounded-2xl">
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
                          <div className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> Durée : {s.durationMinutes} min</div>
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
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-all flex items-center justify-center"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ADMIN: CLIENTS */}
            {tab === 'admin_clients' && data.clients && (
              <div className="card p-6 bg-white shadow-sm border-slate-100 rounded-2xl">
                <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2"><Users className="text-blue-600" /> Liste des clients</h2>
                {data.clients.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Aucun client enregistré.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                          <th className="pb-3">Nom Complet</th>
                          <th className="pb-3">E-mail</th>
                          <th className="pb-3">Téléphone</th>
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
                            <td className="py-4 text-center text-yellow-600 font-extrabold flex items-center justify-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-500" /> {c.loyaltyPoints}
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

            {/* ── ADMIN: FLUX FINANCIERS */}
            {tab === 'admin_transactions' && data.transactions && (
              <div className="card p-6 bg-white shadow-sm border-slate-100 rounded-2xl">
                <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2"><DollarSign className="text-blue-600" /> Historique des mouvements financiers des Wallets</h2>
                {data.transactions.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Aucun mouvement financier enregistré.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[750px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium text-left">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Client</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Méthode</th>
                          <th className="pb-3 text-right">Montant</th>
                          <th className="pb-3 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((t: any) => (
                          <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 text-slate-500 text-xs">{formatDate(t.createdAt)}</td>
                            <td className="py-3.5 font-bold text-slate-800">{t.user?.prenom} {t.user?.nom}</td>
                            <td className="py-3.5">
                              <span className={`font-semibold text-xs py-0.5 px-2 rounded-full ${t.type === 'RECHARGE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {t.type === 'RECHARGE' ? 'Crédit (Recharge)' : 'Débit (Paiement)'}
                              </span>
                            </td>
                            <td className="py-3.5 font-medium text-slate-600 text-xs">{t.moyenPaiement}</td>
                            <td className={`py-3.5 text-right font-extrabold ${t.montant > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {t.montant > 0 ? `+${fcfa(t.montant)}` : fcfa(t.montant)}
                            </td>
                            <td className="py-3.5 text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.statut === 'REUSSIE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                {t.statut === 'REUSSIE' ? 'Réussie' : 'Échouée'}
                              </span>
                            </td>
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
              <div className="card p-6 bg-white shadow-sm border-slate-100 rounded-2xl">
                <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2"><MessageSquare className="text-blue-600" /> Témoignages et avis clients</h2>
                <AdminReviewsList actionLoading={actionLoading} onDeleteReview={handleDeleteReview} />
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
              {/* Select Service */}
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

              {/* Select Vehicle */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sélectionner le véhicule à laver *</label>
                {!data.vehicles || data.vehicles.length === 0 ? (
                  <div className="p-3 bg-yellow-50 text-yellow-800 rounded-xl text-xs border border-yellow-200 font-medium">
                    ⚠️ Aucun véhicule enregistré. Veuillez d'abord ajouter un camion dans l'onglet **"Mes véhicules"** avant de réserver.
                  </div>
                ) : (
                  <select
                    value={bookingVehicleId}
                    onChange={(e) => setBookingVehicleId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {data.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.matricule} - {v.marque} ({v.type})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Select Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Heure *</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              
              {/* Wallet Check & Summary */}
              {selectedServiceId > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Prix du service :</span>
                    <span className="font-bold text-slate-800">{fcfa(services.find(s => s.id === selectedServiceId)?.prixFcfa || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Votre Solde Wallet :</span>
                    <span className={`font-bold ${data.wallet && data.wallet.solde >= (services.find(s => s.id === selectedServiceId)?.prixFcfa || 0) ? 'text-green-600' : 'text-red-500'}`}>
                      {fcfa(data.wallet?.solde || 0)}
                    </span>
                  </div>
                  
                  {data.wallet && data.wallet.solde < (services.find(s => s.id === selectedServiceId)?.prixFcfa || 0) && (
                    <div className="bg-red-50 text-red-600 text-xs px-3.5 py-2.5 rounded-xl font-medium border border-red-100">
                      ⚠️ Solde insuffisant. Veuillez recharger votre Wallet avant de poursuivre.
                    </div>
                  )}
                </div>
              )}
              
              {bookingError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">{bookingError}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                disabled={isBooking}
                onClick={() => { setBookingStation(null); setBookingError(''); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
              >
                Annuler
              </button>
              <button
                disabled={isBooking || !data.vehicles || data.vehicles.length === 0 || !data.wallet || data.wallet.solde < (services.find(s => s.id === selectedServiceId)?.prixFcfa || 0)}
                onClick={handleBook}
                className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                {isBooking && <Loader2 size={16} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Recharge Modal (Simulated Payment Interface) */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Recharger mon Wallet</h3>
            <p className="text-slate-500 text-xs mb-6">Sélectionnez le montant et la méthode de paiement Mobile Money ou Carte.</p>

            <form onSubmit={handleRechargeWallet} className="space-y-4 mb-6">
              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Moyen de paiement *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ORANGE_MONEY', label: 'Orange Money' },
                    { id: 'MTN_MOMO',     label: 'MTN MoMo' },
                    { id: 'VISA',         label: 'Visa' },
                    { id: 'MASTERCARD',   label: 'Mastercard' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setRechargeForm({ ...rechargeForm, moyenPaiement: m.id })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        rechargeForm.moyenPaiement === m.id
                          ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Quick Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Prédéfinis (FCFA)</label>
                <div className="grid grid-cols-4 gap-2">
                  {['5000', '10000', '20000', '50000'].map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setRechargeForm({ ...rechargeForm, montant: a })}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                        rechargeForm.montant === a
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Montant Libre (FCFA) *</label>
                <input
                  required
                  type="number"
                  min="500"
                  step="500"
                  value={rechargeForm.montant}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, montant: e.target.value })}
                  placeholder="Entrez le montant à déposer"
                  className="input text-sm"
                />
              </div>

              {/* Simulate Failure Switch */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Simuler un échec de paiement</span>
                  <span className="block text-[10px] text-slate-400">Pour tester le parcours de rejet client</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRechargeForm({ ...rechargeForm, simulateFail: !rechargeForm.simulateFail })}
                  className="transition-transform active:scale-95"
                >
                  {rechargeForm.simulateFail ? (
                    <ToggleRight className="text-red-500" size={32} />
                  ) : (
                    <ToggleLeft className="text-slate-300" size={32} />
                  )}
                </button>
              </div>

              {rechargeError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">{rechargeError}</div>
              )}
              {rechargeSuccess && (
                <div className="bg-green-50 text-green-700 text-xs px-4 py-3 rounded-xl font-medium border border-green-100 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {rechargeSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isRecharging}
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={isRecharging || !rechargeForm.montant}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow"
                >
                  {isRecharging && <Loader2 size={16} className="animate-spin" />}
                  Simuler la transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Create/Edit Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {editingVehicle ? `Modifier le véhicule ${editingVehicle.matricule}` : 'Enregistrer un nouveau véhicule'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">Ajoutez les détails de votre camion pour les associer à vos réservations.</p>

            <form onSubmit={handleVehicleSubmit} className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Numéro d'immatriculation / Matricule *</label>
                <input
                  required
                  value={vehicleForm.matricule}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, matricule: e.target.value })}
                  placeholder="LT-456-AB"
                  className="input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Marque du camion *</label>
                  <input
                    required
                    value={vehicleForm.marque}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, marque: e.target.value })}
                    placeholder="Mercedes, Volvo, Scania"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Modèle (Optionnel)</label>
                  <input
                    value={vehicleForm.modele}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, modele: e.target.value })}
                    placeholder="Actros, FH16"
                    className="input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type de véhicule *</label>
                <select
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option>Tracteur routier</option>
                  <option>Semi-remorque</option>
                  <option>Camion Benne</option>
                  <option>Citerne</option>
                  <option>Plateau</option>
                  <option>Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Couleur (Optionnel)</label>
                  <input
                    value={vehicleForm.couleur}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, couleur: e.target.value })}
                    placeholder="Bleu, Blanc"
                    className="input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Informations complémentaires</label>
                <textarea
                  rows={2}
                  value={vehicleForm.infos}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, infos: e.target.value })}
                  placeholder="Gabarit spécial, remarques pour le lavage..."
                  className="input text-sm resize-none"
                />
              </div>

              {actionError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">{actionError}</div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowAddVehicle(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
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
                  {[1, 2, 3, 4, 5].map((star) => (
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
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">{reviewError}</div>
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
                className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                {isReviewing && <Loader2 size={16} className="animate-spin" />}
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
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">{actionError}</div>
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
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
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
                    {serviceForm.active ? <ToggleRight className="text-green-600" size={36} /> : <ToggleLeft className="text-slate-300" size={36} />}
                  </button>
                  <span className="text-xs font-semibold text-slate-600">Service actif</span>
                </div>
              </div>

              {actionError && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl font-medium border border-red-100">{actionError}</div>
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
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  {editingService ? 'Mettre à jour' : 'Créer le service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignWash && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Station complète</h3>
            <p className="text-slate-500 text-sm mb-6">
              La station <strong>{stations.find(s => s.id === reassignWash.stationId)?.nom || 'sélectionnée'}</strong> est complète (0 places libres). 
              Veuillez réaffecter ce lavage vers une autre station disponible ou refuser la réservation.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stations disponibles</label>
                {stations.filter(s => s.statut === 'ACTIVE' && s.placesLibres > 0).length === 0 ? (
                  <div className="bg-orange-50 text-orange-700 text-xs px-4 py-3 rounded-xl font-medium">
                    Aucune autre station n'a de places libres actuellement.
                  </div>
                ) : (
                  <select
                    value={selectedNewStationId}
                    onChange={(e) => setSelectedNewStationId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {stations
                      .filter(s => s.statut === 'ACTIVE' && s.placesLibres > 0)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nom} ({s.placesLibres} places libres - {s.quartier})
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    setReassignWash(null)
                    setSelectedNewStationId(0)
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Fermer
                </button>
                <button
                  disabled={actionLoading || selectedNewStationId === 0}
                  onClick={() => handleReassignAndAccept(reassignWash.id, selectedNewStationId)}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Réaffecter et Valider
                </button>
              </div>
              <button
                disabled={actionLoading}
                onClick={async () => {
                  if (confirm('Voulez-vous refuser cette réservation ?')) {
                    await handleUpdateWashStatus(reassignWash.id, 'REJECTED')
                    setReassignWash(null)
                    setSelectedNewStationId(0)
                  }
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-all border border-red-100"
              >
                Refuser la réservation
              </button>
            </div>
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

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>

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
                  <Star key={i} size={12} className={`text-yellow-400 ${i < r.rating ? 'fill-yellow-400' : 'text-slate-200'}`} />
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
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
