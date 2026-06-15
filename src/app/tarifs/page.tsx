import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { fcfa } from '@/lib/format'

const FORMULES = [
  { nom:'Express', prix:8000,  duree:'30 min', couleur:'border-yellow-300', badge:'',          prestations:['Carrosserie avant et latéraux','Cabine extérieure','Pare-brise','Jantes'] },
  { nom:'Complet', prix:15000, duree:'45 min', couleur:'border-blue-500',   badge:'Populaire', prestations:['Carrosserie complète','Châssis et dessous','Jantes et pneus','Vitres et rétroviseurs'] },
  { nom:'Premium', prix:25000, duree:'90 min', couleur:'border-purple-400', badge:'',          prestations:['Tout du Complet','Désinfection cabine','Traitement protecteur','Rapport d\'intervention'] },
]

const GRILLE = [
  { service:'Lavage Express',          camion:8000,  semi:10000, citerne:12000 },
  { service:'Lavage Extérieur Complet',camion:15000, semi:18000, citerne:22000 },
  { service:'Nettoyage Moteur',         camion:10000, semi:10000, citerne:12000 },
  { service:'Désinfection Cabine',      camion:10000, semi:10000, citerne:10000 },
  { service:'Éco-lavage',               camion:12000, semi:15000, citerne:18000 },
  { service:'Lavage Citerne/Benne',     camion:null,  semi:null,  citerne:35000 },
  { service:'Anti-corrosion châssis',   camion:18000, semi:24000, citerne:30000 },
]

export default function TarifsPage() {
  return (
    <>
      <section className="pt-24 pb-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Tarifs</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">Prix transparents en Franc CFA (XAF). Toutes taxes comprises.</p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">Nos formules</h2>
          <p className="section-sub text-center">Prix affichés en FCFA (XAF).</p>
          <div className="grid md:grid-cols-3 gap-8">
            {FORMULES.map(({ nom, prix, duree, couleur, badge, prestations }) => (
              <div key={nom} className={`card p-8 border-2 ${couleur} relative flex flex-col`}>
                {badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-xs font-bold px-4 py-1 rounded-full">{badge}</div>}
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{nom}</h3>
                <div className="text-xs text-slate-400 mb-6">Durée : {duree}</div>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-slate-900">{prix.toLocaleString('fr-FR')}</span>
                  <span className="text-slate-400 text-sm ml-2">FCFA</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {prestations.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={15} className="text-green-500 shrink-0"/> {p}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription" className="btn-primary justify-center">Réserver <ArrowRight size={16}/></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">Grille tarifaire détaillée</h2>
          <p className="section-sub text-center">Tarifs en FCFA (XAF) par type de véhicule.</p>
          <div className="overflow-x-auto rounded-2xl shadow border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Prestation</th>
                  <th className="px-6 py-4 text-center font-semibold">Camion porteur</th>
                  <th className="px-6 py-4 text-center font-semibold">Semi-remorque</th>
                  <th className="px-6 py-4 text-center font-semibold">Citerne / Benne</th>
                </tr>
              </thead>
              <tbody>
                {GRILLE.map(({ service, camion, semi, citerne }, i) => (
                  <tr key={service} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-4 font-medium text-slate-800">{service}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{camion ? fcfa(camion) : '—'}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{semi   ? fcfa(semi)   : '—'}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{citerne? fcfa(citerne): '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-slate-400 text-xs mt-4">Tarifs en Franc CFA (XAF). Devis flotte sur demande.</p>
        </div>
      </section>
    </>
  )
}
