'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function LaporanPage() {
  const [summary, setSummary] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchLaporan()
  }, [])

  async function fetchLaporan() {
    const res = await fetch('/api/reports')
    const data = await res.json()
    setSummary(data.summary)
    setSalesData(data.chartData)
    setTransactions(data.recentTransactions)
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">📊 Laporan Keuangan</h1>

        {/* SUMMARY CARDS */}
        {summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <SummaryCard
              icon={<DollarSign className="text-green-500" />}
              title="Total Omzet"
              value={`Rp ${Number(summary.totalOmzet).toLocaleString()}`}
              color="from-green-100 to-green-50"
            />
            <SummaryCard
              icon={<ShoppingBag className="text-amber-500" />}
              title="Jumlah Transaksi"
              value={summary.totalTransaksi}
              color="from-amber-100 to-amber-50"
            />
            <SummaryCard
              icon={<TrendingUp className="text-blue-500" />}
              title="Rata-rata Transaksi"
              value={`Rp ${Number(summary.avgPerTransaksi).toLocaleString()}`}
              color="from-blue-100 to-blue-50"
            />
            <SummaryCard
              icon={<Package className="text-purple-500" />}
              title="Nilai Stok"
              value={`Rp ${Number(summary.totalStockValue).toLocaleString()}`}
              color="from-purple-100 to-purple-50"
            />
          </div>
        ) : (
          <div className="text-center text-slate-400 py-20">Memuat data laporan...</div>
        )}

        {/* SALES CHART */}
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-slate-200 mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Grafik Penjualan Mingguan</h2>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={salesData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                <XAxis dataKey="date" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm">Belum ada data transaksi minggu ini.</p>
          )}
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Transaksi Terakhir</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-amber-50 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Invoice</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Kasir</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-amber-50 transition">
                    <td className="py-3 px-4 text-slate-800 font-medium">{t.invoiceNo}</td>
                    <td className="py-3 px-4 text-slate-600">{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4 text-slate-600">{t.user?.fullName || '—'}</td>
                    <td className="py-3 px-4 text-right text-amber-600 font-semibold">Rp {Number(t.totalAmount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center text-slate-400 py-6">Belum ada transaksi.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ icon, title, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl shadow p-5 flex items-center justify-between`}>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-slate-800 text-xl font-semibold mt-1">{value}</p>
      </div>
      <div className="bg-white/70 p-3 rounded-full shadow-inner">{icon}</div>
    </div>
  )
}
