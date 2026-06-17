'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Truck, CalendarCheck, MapPin, ShieldCheck, Droplets, Clock, Star, ArrowRight, CheckCircle2, Zap, Leaf, Loader2 } from 'lucide-react'

interface Stats { totalLavages:number; totalClients:number; stationsActives:number; tauxSatisfaction:number; anneesExperience:number }

const SERVICES_PREVIEW = [
  { icon:Droplets,    title:'Lavage Extérieur', desc:'Haute pression carrosserie, cabine et châssis.',  color:'bg-blue-50 text-blue-600' },
  { icon:Zap,         title:'Lavage Express',   desc:'Formule rapide 30 min pour les pressés.',         color:'bg-yellow-50 text-yellow-600' },
  { icon:ShieldCheck, title:'Désinfection',     desc:'Traitement intérieur cabine et chargement.',      color:'bg-green-50 text-green-600' },
  { icon:Leaf,        title:'Éco-lavage',        desc:'70% moins d\'eau, produits biodégradables.',     color:'bg-emerald-50 text-emerald-600' },
]

export default function HomePage() {
  const [stats, setStats]     = useState<Stats|null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r=>r.json()).catch(()=>null),
      fetch('/api/reviews').then(r=>r.json()).catch(()=>[]),
    ]).then(([statsData, reviewsData]) => {
      setStats(statsData && !statsData.message ? statsData : null)
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
    }).finally(()=>setLoading(false))
  }, [])

  const statsDisplay = [
    { value: stats && stats.totalLavages !== undefined ? stats.totalLavages.toLocaleString('fr-FR') : '—', label:'Poids lourds lavés' },
    { value: stats && stats.stationsActives !== undefined ? `${stats.stationsActives}` : '—', label:'Stations actives' },
    { value: stats && stats.anneesExperience !== undefined ? `${stats.anneesExperience} ${stats.anneesExperience > 1 ? 'ans' : 'an'}` : '—', label:'D\'expérience' },
    { value: stats && stats.tauxSatisfaction !== undefined ? `${stats.tauxSatisfaction}%` : '—', label:'Clients satisfaits' },
  ]

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-slate-950 overflow-hidden">
        {/* Background of the main station */}
        <div 
          className="absolute inset-0 bg-[url('/laverie.jfif')] bg-cover bg-center opacity-20 mix-blend-overlay"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-blue-950/80" />
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle at 2px 2px,white 1px,transparent 0)',backgroundSize:'40px 40px'}}/>
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Truck size={14}/> Spécialiste lavage poids lourds — Douala, Cameroun
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Réservez votre<br/><span className="text-blue-400">station de lavage</span><br/>en quelques clics
            </h1>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-xl">
              12 stations modernes à Douala, dédiées aux poids lourds. Réservez, gérez vos véhicules et cumulez des points de fidélité.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/inscription" className="btn-primary text-base py-3 px-8">Réserver maintenant <ArrowRight size={18}/></Link>
              <Link href="/carte" className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base py-3 px-8 rounded-full transition-all">
                <MapPin size={18}/> Voir les stations
              </Link>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {statsDisplay.map(({value,label}) => (
              <div key={label} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                {loading ? <Loader2 className="animate-spin text-white mx-auto mb-1" size={28}/> :
                  <div className="text-4xl font-extrabold text-white mb-1">{value}</div>}
                <div className="text-slate-400 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* À PROPOS DE NOUS */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            ℹ️ À propos de nous
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-6">
            Votre partenaire de confiance pour le lavage de poids lourds
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
            Depuis <strong>2025</strong>, notre laverie met à votre disposition des stations de lavage modernes pour poids lourds, avec un service rapide, fiable et adapté aux besoins des professionnels.
          </p>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Comment ça marche ?</h2>
          <p className="section-sub">Réserver une station n'a jamais été aussi simple.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {step:'1',icon:CalendarCheck,title:'Créez votre compte',   desc:'Inscription gratuite en 2 minutes.'},
              {step:'2',icon:Truck,        title:'Ajoutez vos véhicules',desc:'Enregistrez vos poids lourds.'},
              {step:'3',icon:MapPin,       title:'Choisissez une station',desc:'Disponibilité en temps réel.'},
              {step:'4',icon:Droplets,     title:'Lavez & cumulez',      desc:'Points fidélité à chaque passage.'},
            ].map(({step,icon:Icon,title,desc}) => (
              <div key={step} className="relative flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Icon className="text-white" size={24}/>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full text-xs font-bold flex items-center justify-center">{step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Nos services</h2>
          <p className="section-sub">Des formules adaptées à chaque besoin.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_PREVIEW.map(({icon:Icon,title,desc,color}) => (
              <div key={title} className="card p-6 text-left hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}><Icon size={22}/></div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 mt-10 text-blue-700 font-semibold hover:text-blue-900">
            Voir tous les services <ArrowRight size={16}/>
          </Link>
        </div>
      </section>

      {/* FIDÉLITÉ */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold mb-4">👑 Programme de fidélité</div>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-900 mb-4">Lavez plus,<br/>payez moins !</h2>
            <p className="text-yellow-800 text-lg">Chaque lavage vous rapporte des points. Atteignez les paliers pour débloquer des réductions et des lavages gratuits.</p>
          </div>
          <div className="space-y-4">
            {[
              {palier:'5 lavages', icon:'🥉', label:'Bronze', desc:'5% de réduction sur votre prochain lavage'},
              {palier:'10 lavages',icon:'🥈', label:'Argent', desc:'10% de réduction sur votre prochain lavage'},
              {palier:'20 lavages',icon:'🏆', label:'Or',     desc:'Un lavage gratuit offert !'},
            ].map(({palier,icon,label,desc}) => (
              <div key={label} className="bg-white/25 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div><div className="font-bold text-yellow-900">{palier} — Niveau {label}</div>
                <div className="text-yellow-800 text-sm">{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pourquoi choisir LaveriePro ?</h2>
            <ul className="space-y-3">
              {['Réservation en ligne 24h/24','Disponibilité en temps réel','Confirmation immédiate par e-mail',
                'Programme de fidélité avec récompenses','Gestion multi-véhicules','12 stations à Douala'].map(a => (
                <li key={a} className="flex items-center gap-3 text-white">
                  <CheckCircle2 size={20} className="text-blue-300 shrink-0"/><span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6"><Clock className="text-blue-200" size={24}/><h3 className="text-white font-bold text-xl">Horaires d'ouverture</h3></div>
            {[['Lundi – Vendredi','06h00 – 22h00'],['Samedi','06h00 – 20h00'],['Dimanche','08h00 – 18h00'],['Jours fériés','08h00 – 16h00']].map(([j,h]) => (
              <div key={j} className="flex justify-between py-3 border-b border-white/10 last:border-0">
                <span className="text-blue-100">{j}</span><span className="text-white font-semibold">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Ils nous font confiance</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="card p-6 text-left">
                <div className="flex mb-4">
                  {Array.from({length:5}).map((_,i)=>(
                    <Star key={i} size={16} className={`text-yellow-400 ${i < r.rating ? 'fill-yellow-400' : 'text-slate-200'}`}/>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{r.texte}"</p>
                <div><div className="font-bold text-slate-900 text-sm">{r.nom}</div><div className="text-slate-400 text-xs">{r.poste}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="section-title">Prêt à réserver ?</h2>
          <p className="text-slate-500 text-lg mb-8">Créez votre compte gratuitement et réservez en moins de 5 minutes.</p>
          <Link href="/inscription" className="btn-primary text-lg py-4 px-10">Commencer gratuitement <ArrowRight size={20}/></Link>
        </div>
      </section>
    </>
  )
}
