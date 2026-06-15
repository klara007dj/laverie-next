import Link from 'next/link'
import { Droplets, MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Droplets className="text-white w-5 h-5" />
              </div>
              LaveriePro
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Spécialiste du lavage de poids lourds à Douala depuis 2010.
              12 stations réparties dans toute la ville.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3 mt-4">
              {['Facebook', 'WhatsApp'].map(r => (
                <a key={r} href="#" className="w-8 h-8 bg-slate-700 hover:bg-blue-700 rounded-lg flex items-center justify-center text-xs font-bold transition-colors">
                  {r[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Accueil'], ['/services', 'Services'], ['/tarifs', 'Tarifs'], ['/carte', 'Nos Stations'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link href={to} className="hover:text-blue-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="text-white font-semibold mb-4">Votre espace</h4>
            <ul className="space-y-2 text-sm">
              {[['/inscription', 'Créer un compte'], ['/connexion', 'Se connecter'], ['/dashboard', 'Mon tableau de bord'], ['/dashboard#reservations', 'Mes réservations'], ['/dashboard#fidelite', 'Programme fidélité']].map(([to, label]) => (
                <li key={to}><Link href={to} className="hover:text-blue-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact Cameroun */}
          <div>
            <h4 className="text-white font-semibold mb-4">Nous contacter</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 text-blue-400 shrink-0" />
                <span>Zone Industrielle de Bassa<br />Douala, Cameroun</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-blue-400 shrink-0" />
                <a href="tel:+237696000000" className="hover:text-blue-400">+237 6 96 00 00 00</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-blue-400 shrink-0" />
                <a href="mailto:contact@laveriepro.cm" className="hover:text-blue-400">contact@laveriepro.cm</a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 text-blue-400 shrink-0" />
                <span>Lun–Sam : 06h00 – 22h00<br />Dim : 08h00 – 18h00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LaveriePro Douala — Tous droits réservés</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-400">Mentions légales</a>
            <a href="#" className="hover:text-blue-400">CGU</a>
            <a href="#" className="hover:text-blue-400">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
