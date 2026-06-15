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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-blue-900">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center"><Droplets className="text-white w-5 h-5"/></div>
            LaveriePro
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-1">Créer un compte</h1>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={handle} placeholder="+237 6 XX XX XX XX" className="input"/>
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
  )
}
