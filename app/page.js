'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      return alert("Username dan password wajib diisi")
    }

    setLoading(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // penting untuk cookie JWT
      cache: 'no-store',      // hindari caching di Next.js
    })

    setLoading(false)

    if (res.ok) {
      router.replace('/dashboard')  // lebih aman dari push()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Login gagal')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-[380px] shadow-2xl border border-white/20">
        <div className="flex flex-col items-center mb-6">
          <Coffee size={42} className="text-amber-400 mb-2" />
          <h1 className="text-white text-2xl font-semibold tracking-wide">KAPPU POS</h1>
          <p className="text-gray-300 text-sm mt-1">Masuk ke sistem kasir</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Username</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Masukkan username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Masukkan password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded-md text-white font-medium transition-all duration-200"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
