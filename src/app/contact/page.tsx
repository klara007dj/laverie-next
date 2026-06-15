'use client'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ nom:'', email:'', telephone:'', sujet:'', message:'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const handle = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    await new Promise(r => setTimeout(r, 900)); setSent(true); setLoading(false)
  }
  return (
    <>
      <section className="pt-24 pb-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Contactez-nous</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">Notre équipe à Douala vous répond sous 24h.</p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Nos coordonnées</h2>
              <div className="space-y-4">
                {[
                  { icon:MapPin, label:'Adresse',   val:'Zone Industrielle de Bassa\nDouala, Cameroun' },
                  { icon:Phone,  label:'Téléphone', val:'+237 6 99 86 19 68' },
                  { icon:Mail,   label:'E-mail',    val:'contact@laveriepro.cm' },
                ].map(({ icon:Icon, label, val }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Icon size={18} className="text-blue-700"/></div>
                    <div><div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
                    <div className="text-slate-800 text-sm whitespace-pre-line">{val}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4"><Clock size={18} className="text-blue-700"/><h3 className="font-bold text-slate-900">Horaires</h3></div>
              {[['Lun–Ven','06h00–22h00'],['Samedi','06h00–20h00'],['Dimanche','08h00–18h00']].map(([j,h]) => (
                <div key={j} className="flex justify-between py-2 border-b border-slate-200 last:border-0 text-sm">
                  <span className="text-slate-500">{j}</span><span className="font-semibold text-slate-800">{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-green-50 rounded-2xl border border-green-200">
                <CheckCircle2 size={64} className="text-green-500 mb-4"/>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                <p className="text-slate-500">Nous vous répondrons sous 24h.</p>
                <button onClick={() => setSent(false)} className="mt-6 btn-outline">Envoyer un autre message</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Envoyez-nous un message</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom *</label>
                    <input name="nom" value={form.nom} onChange={handle} required placeholder="Jean Kamdem" className="input"/></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">E-mail *</label>
                    <input name="email" type="email" value={form.email} onChange={handle} required placeholder="jean@transport.cm" className="input"/></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Téléphone</label>
                    <input name="telephone" value={form.telephone} onChange={handle} placeholder="+237 6 XX XX XX XX" className="input"/></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Sujet *</label>
                    <select name="sujet" value={form.sujet} onChange={handle} required className="input">
                      <option value="">Choisir un sujet</option>
                      <option>Demande de devis</option><option>Réservation de groupe</option>
                      <option>Problème technique</option><option>Autre</option>
                    </select></div>
                </div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Message *</label>
                  <textarea name="message" value={form.message} onChange={handle} required rows={5} placeholder="Décrivez votre demande..." className="input resize-none"/></div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? 'Envoi…' : <><Send size={16}/> Envoyer le message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
