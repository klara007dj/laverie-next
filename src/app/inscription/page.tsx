'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Droplets, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function InscriptionPage() {
  const [form, setForm]     = useState({ nom:'', prenom:'', email:'', telephone:'', password:'', confirm:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [done, setDone]     = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas.')
    if (form.password.length < 6) return setError('Mot de passe : 6 caractères minimum.')
    
    const phoneRegex = /^\+237\s*6\s*([0-9]\s*){8}$/
    if (!phoneRegex.test(form.telephone.trim())) {
      return setError('Le numéro de téléphone doit être au format +237 6 xx xx xx xx.')
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/inscription', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user',  JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl text-blue-900">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                <img src="/hautePression.jfif" className="w-full h-full object-cover" alt="LaveriePro Logo" />
              </div>
              LaveriePro
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-1">Créer un compte</h1>
            <p className="text-slate-500 text-sm">Rejoignez LaveriePro et gérez vos réservations.</p>
          </div>
          <div className="card p-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom *</label>
                  <input name="nom" value={form.nom} onChange={handle} required placeholder="Kamdem" className="input"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handle} required placeholder="Jean" className="input"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">E-mail *</label>
                <input name="email" type="email" value={form.email} onChange={handle} required placeholder="jean@transport.cm" className="input"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Téléphone *</label>
                <input name="telephone" value={form.telephone} onChange={handle} required placeholder="+237 6 XX XX XX XX" className="input"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handle} required placeholder="6 caractères minimum" className="input pr-11"/>
                  <button type="button" onClick={() => setShowPwd(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirmer le mot de passe *</label>
                <input name="confirm" type={showPwd ? 'text' : 'password'} value={form.confirm} onChange={handle} required placeholder="Répétez le mot de passe" className="input"/>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading ? 'Création en cours…' : 'Créer mon compte'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-6">
              Déjà un compte ? <Link href="/connexion" className="text-blue-700 font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Image Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-[url('/camionBleu.jfif')] bg-cover bg-center opacity-60"
          style={{ transform: 'scale(1.02)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950 via-slate-900/40 to-transparent" />
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-3xl font-extrabold leading-tight mb-4 text-white">
              Une propreté irréprochable pour vos poids lourds
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              LaveriePro vous accompagne dans l'entretien quotidien de vos véhicules. Réservez une station équipée en moins de 2 minutes partout à Douala.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
