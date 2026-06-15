import { Droplets, Zap, ShieldCheck, Leaf, Truck, Settings, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const SERVICES = [
  { icon:Droplets,    color:'bg-blue-50 text-blue-600 border-blue-100',    title:'Lavage Extérieur Complet', desc:'Nettoyage haute pression de la carrosserie, cabine, châssis et roues.', duree:'45 min', prix:15000, inclus:['Carrosserie haute pression','Châssis et dessous de caisse','Jantes et pneus','Vitres et rétroviseurs'] },
  { icon:Zap,         color:'bg-yellow-50 text-yellow-600 border-yellow-100',title:'Lavage Express',         desc:'Formule rapide pour les professionnels pressés. Nettoyage efficace en 30 min.', duree:'30 min', prix:8000,  inclus:['Carrosserie avant et latéraux','Cabine extérieure','Pare-brise','Jantes'] },
  { icon:ShieldCheck, color:'bg-green-50 text-green-600 border-green-100',  title:'Désinfection Cabine',    desc:'Traitement désinfectant complet de l\'habitacle. Idéal pour le transport alimentaire.', duree:'60 min', prix:10000, inclus:['Désinfection habitacle','Zone de chargement','Purification air','Certification fournie'] },
  { icon:Leaf,        color:'bg-emerald-50 text-emerald-600 border-emerald-100',title:'Éco-Lavage',         desc:'70% moins d\'eau grâce au recyclage. Produits 100% biodégradables.', duree:'50 min', prix:12000, inclus:['Eau recyclée à 70%','Produits biodégradables','Carrosserie complète','Bilan carbone réduit'] },
  { icon:Truck,       color:'bg-purple-50 text-purple-600 border-purple-100',title:'Lavage Citerne/Benne',  desc:'Nettoyage spécialisé pour citernes, bennes et semi-remorques.', duree:'90 min', prix:35000, inclus:['Intérieur citerne','Benne et ridelles','Carrosserie complète','Rapport d\'intervention'] },
  { icon:Settings,    color:'bg-orange-50 text-orange-600 border-orange-100',title:'Anti-Corrosion',         desc:'Traitement protecteur châssis et parties métalliques. Garantie 6 mois.', duree:'120 min', prix:18000, inclus:['Traitement châssis complet','Protection contre le sel','Sous-caisse','Garantie 6 mois'] },
]

export default function ServicesPage() {
  return (
    <>
      <section className="pt-24 pb-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Nos Services</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">Formules adaptées à chaque type de véhicule. Tarifs en FCFA.</p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ icon:Icon, color, title, desc, duree, prix, inclus }) => {
              const [bg, txt, border] = color.split(' ')
              return (
                <div key={title} className={`card p-6 border-2 ${border} flex flex-col`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${bg} ${txt}`}><Icon size={26}/></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-3">{desc}</p>
                  <div className="text-xs text-slate-400 mb-1">Durée : <span className="font-bold text-slate-700">{duree}</span></div>
                  <div className="text-sm font-bold text-blue-900 mb-4">{prix.toLocaleString('fr-FR')} FCFA</div>
                  <ul className="space-y-2 mt-auto">
                    {inclus.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0"/> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-16">
            <Link href="/contact" className="btn-primary">Demander un devis personnalisé</Link>
          </div>
        </div>
      </section>
    </>
  )
}
