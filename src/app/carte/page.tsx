'use client'
import { useEffect, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-full bg-slate-100"><Loader2 className="animate-spin text-blue-700" size={28}/></div>
)})

const BADGE: Record<string,string> = {
  ACTIVE:'bg-green-100 text-green-700', MAINTENANCE:'bg-orange-100 text-orange-700', FERMEE:'bg-red-100 text-red-700',
}
const LABEL: Record<string,string> = { ACTIVE:'Libre', MAINTENANCE:'Maintenance', FERMEE:'Fermée' }

export default function CartePage() {
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [filtre, setFiltre]     = useState('tous')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/stations').then(r=>r.json()).then(setStations).finally(()=>setLoading(false))
  }, [])

  const filtered = filtre === 'tous' ? stations : stations.filter(s => {
    if (filtre === 'libre')  return s.statut === 'ACTIVE' && s.placesLibres > 0
    if (filtre === 'complet') return s.statut === 'ACTIVE' && s.placesLibres === 0
    return s.statut === filtre.toUpperCase()
  })

  return (
    <>
      <section className="pt-24 pb-8 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Nos 12 Stations — Douala</h1>
          <p className="text-slate-300 text-lg">Disponibilité en temps réel.</p>
        </div>
      </section>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {['tous','libre','complet','MAINTENANCE'].map(f => (
              <button key={f} onClick={() => setFiltre(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize ${
                  filtre === f ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                }`}>{f === 'tous' ? 'Toutes' : f === 'MAINTENANCE' ? 'Maintenance' : f}</button>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Liste */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {loading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28}/></div>}
              {filtered.map(s => (
                <div key={s.id} onClick={() => setSelected(s)}
                  className={`card p-4 cursor-pointer transition-all ${selected?.id === s.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">{s.nom}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.statut === 'ACTIVE' && s.placesLibres > 0 ? 'bg-green-100 text-green-700' :
                      s.statut === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>{s.statut === 'ACTIVE' ? (s.placesLibres > 0 ? 'Libre' : 'Complet') : 'Maintenance'}</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2">{s.adresse}</p>
                  <p className="text-slate-500 text-xs">Occupation : {s.totalPlaces - s.placesLibres}/{s.totalPlaces} · {s.heureOuverture}–{s.heureFermeture}</p>
                </div>
              ))}
            </div>
            {/* Carte */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow border border-slate-100" style={{height:'560px'}}>
              {!loading && <MapView stations={filtered} selected={selected} onSelect={setSelected}/>}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 text-sm text-slate-500">
            {[['#22c55e','Libre'],['#ef4444','Complet'],['#f97316','Maintenance']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{background:c}}/> {l}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
