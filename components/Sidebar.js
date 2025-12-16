'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(null)
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    const handleRoute = () => setOpen(false)
    window.addEventListener('popstate', handleRoute)
    return () => window.removeEventListener('popstate', handleRoute)
  }, [])

  useEffect(() => {
    // Ambil role user dari endpoint /api/auth/me (harus mengembalikan { role: "OWNER" } atau { role: "PEGAWAI" })
    let mounted = true
    async function loadRole() {
      try {
        setLoadingRole(true)
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          setRole(null)
        } else {
          const data = await res.json()
          // endpoint mengembalikan { role: "OWNER" } atau { role: "PEGAWAI" } atau user null
          if (mounted) setRole(data?.role ?? null)
        }
      } catch (err) {
        console.error('Failed to get user role', err)
        if (mounted) setRole(null)
      } finally {
        if (mounted) setLoadingRole(false)
      }
    }
    loadRole()
    return () => { mounted = false }
  }, [])

  async function handleLogout() {
    try {
      // Panggil API logout untuk menghapus cookie httpOnly di server (jika tersedia)
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    } catch (err) {
      console.error('Logout error', err)
    } finally {
      // Pastikan diarahkan ke landing/login
      setOpen(false)
      router.push('/')
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed top-4 left-4 z-50 bg-amber-500 text-white p-2 rounded shadow">
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 text-white p-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-amber-400 font-bold text-xl">KAPPU</div>
                <div className="text-xs text-slate-400">POS</div>
              </div>
              <button onClick={() => setOpen(false)}><X /></button>
            </div>

            <nav className="space-y-2">
              <button onClick={() => { router.push('/dashboard'); setOpen(false) }} className="w-full text-left py-2 rounded hover:bg-slate-800">Dashboard</button>
              <button onClick={() => { router.push('/dashboard/bahan-baku'); setOpen(false) }} className="w-full text-left py-2 rounded hover:bg-slate-800">Bahan Baku</button>

              {/* Tampilkan menu Pegawai hanya jika role === 'OWNER' */}
              {!loadingRole && role === 'OWNER' && (
                <button onClick={() => { router.push('/dashboard/pegawai'); setOpen(false) }} className="w-full text-left py-2 rounded hover:bg-slate-800">Pegawai</button>
              )}

              <button onClick={() => { router.push('/dashboard/laporan'); setOpen(false) }} className="w-full text-left py-2 rounded hover:bg-slate-800">Laporan</button>

              <div className="border-t border-slate-800 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 rounded hover:bg-slate-800 text-amber-300"
                >
                  Logout
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}