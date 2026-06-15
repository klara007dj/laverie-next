'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, TrendingUp, Truck, Droplets, MapPin, Loader2, CalendarDays } from 'lucide-react'
import { fcfa } from '@/lib/format'

function BarItem({ label, value, max, suffix='' }: { label:string; value:number; max:number; suffix?:string }) {
  const pct = Math.round((value/max)*100)
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-500">{suffix === 'FCFA' ? fcfa(value) : value+suffix}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{width:pct+'%'}}/>
      </div>
    </div>
  )
}

export default function RapportsPage() {
  const [resume,   setResume]   = useState<any>(null)
  const [mensuel,  setMensuel]  = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [stns,     setStns]     = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) {
      router.push('/connexion')
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
    } catch {
      router.push('/connexion')
      return
    }

    Promise.all([
      fetch('/api/rapports/resume', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).catch(()=>null),
      fetch('/api/rapports/mensuel', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).catch(()=>[]),
      fetch('/api/rapports/services', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).catch(()=>[]),
      fetch('/api/rapports/stations', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).catch(()=>[]),
    ]).then(([r,m,sv,st]) => { setResume(r); setMensuel(Array.isArray(m)?m:[]); setServices(Array.isArray(sv)?sv:[]); setStns(Array.isArray(st)?st:[]) })
    .finally(() => setLoading(false))
  }, [router])

  const maxMensuel  = mensuel.length  ? Math.max(...mensuel.map((m:any)=>m.total))   : 1
  const maxServices = services.length ? Math.max(...services.map((s:any)=>s.total))  : 1
  const maxRevenus  = stns.length     ? Math.max(...stns.map((s:any)=>s.revenus))    : 1

  return (
    <>
      <section className="pt-24 pb-8 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="text-blue-400" size={32}/>
            <h1 className="text-4xl font-extrabold text-white">Rapports & Statistiques</h1>
          </div>
          <p className="text-slate-300 text-lg">Vue d'ensemble de l'activité de la plateforme.</p>
        </div>
      </section>
      <section className="py-10 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40}/></div>}
          {!loading && (
            <>
              {resume && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                  {[
                    { icon:CalendarDays, label:'Total réservations', value:(resume.totalReservations||0).toLocaleString('fr-FR'), color:'bg-blue-50 text-blue-700' },
                    { icon:Truck,        label:'Lavages effectués',  value:(resume.totalLavages||0).toLocaleString('fr-FR'),      color:'bg-green-50 text-green-700' },
                    { icon:TrendingUp,   label:'Revenus générés',    value:fcfa(resume.totalRevenus||0),                          color:'bg-purple-50 text-purple-700' },
                    { icon:MapPin,       label:'Stations actives',   value:String(resume.stationsActives||0),                    color:'bg-yellow-50 text-yellow-700' },
                  ].map(({ icon:Icon, label, value, color }) => (
                    <div key={label} className="card p-6 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}><Icon size={24}/></div>
                      <div><div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
                      <div className="text-xl font-extrabold text-slate-900">{value}</div></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {mensuel.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500"/> Réservations par mois</h2>
                    {mensuel.map((m:any) => <BarItem key={m.id} label={m.mois} value={m.total} max={maxMensuel} suffix=" réserv."/>)}
                  </div>
                )}
                {services.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Droplets size={20} className="text-blue-500"/> Services les plus demandés</h2>
                    {services.map((s:any) => <BarItem key={s.nom} label={s.nom} value={s.total} max={maxServices} suffix=" lavages"/>)}
                  </div>
                )}
              </div>
              {stns.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><MapPin size={20} className="text-blue-500"/> Statistiques par station</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-slate-100">
                        <th className="pb-3 text-left text-slate-400 font-medium">Station</th>
                        <th className="pb-3 text-center text-slate-400 font-medium">Lavages</th>
                        <th className="pb-3 text-right text-slate-400 font-medium">Revenus</th>
                        <th className="pb-3 text-right text-slate-400 font-medium">Part</th>
                      </tr></thead>
                      <tbody>
                        {stns.map((s:any,i:number) => (
                          <tr key={s.nom} className={i%2===0?'':'bg-slate-50'}>
                            <td className="py-3 font-medium text-slate-800">{s.nom}</td>
                            <td className="py-3 text-center text-slate-600">{s.lavages}</td>
                            <td className="py-3 text-right text-slate-600">{fcfa(s.revenus)}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{width:Math.round(s.revenus/maxRevenus*100)+'%'}}/>
                                </div>
                                <span className="text-xs text-slate-400">{Math.round(s.revenus/maxRevenus*100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
