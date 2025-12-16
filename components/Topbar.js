'use client'

import { useEffect, useState } from 'react'

export default function Topbar() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Kelola produk, transaksi, dan laporan</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">{time.toLocaleString('id-ID')}</div>
        <div className="px-3 py-1 bg-slate-100 rounded text-sm text-slate-700">Online</div>
      </div>
    </div>
  )
}
