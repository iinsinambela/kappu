'use client'

import { useMemo, useState } from 'react'

export default function POSForm({ cart = [], onRemove, onUpdateQty, onCheckout, loading }) {
  const [paidAmount, setPaidAmount] = useState('')

  const total = useMemo(() => cart.reduce((s, i) => s + (Number(i.price) * Number(i.qty || 0)), 0), [cart])
  const change = paidAmount ? Number(paidAmount) - total : 0

  return (
    <div className="bg-white rounded-2xl shadow p-4 border">
      <h3 className="text-lg font-semibold mb-3">Transaksi</h3>

      <div className="max-h-64 overflow-auto space-y-2 mb-3">
        {cart.length === 0 ? (
          <div className="text-slate-400">Keranjang kosong</div>
        ) : cart.map(item => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50">
            <div className="flex-1">
              <div className="font-medium text-slate-700">{item.name}</div>
              <div className="text-sm text-slate-500">Rp {Number(item.price).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={e => onUpdateQty(item.id, Number(e.target.value || 1))}
                className="w-20 p-1 text-center border rounded"
              />
              <div className="text-slate-700">Rp {(item.price * item.qty).toLocaleString()}</div>
              <button onClick={() => onRemove(item.id)} className="text-red-500 ml-2">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-3">
        <div className="flex justify-between text-slate-700 font-medium">
          <span>Total</span>
          <span>Rp {Number(total).toLocaleString()}</span>
        </div>

        <input
          type="number"
          placeholder="Nominal dibayar"
          value={paidAmount}
          onChange={e => setPaidAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-slate-50 focus:ring-2 focus:ring-amber-400"
        />

        <div className="flex gap-2">
          <button
            onClick={() => onCheckout(Number(paidAmount))}
            disabled={loading}
            className={`flex-1 py-2 rounded bg-amber-500 text-white font-medium ${loading ? 'opacity-70' : 'hover:bg-amber-600'}`}
          >
            {loading ? 'Memproses...' : 'Selesaikan Transaksi'}
          </button>
        </div>

        {paidAmount && (
          <div className="text-right text-slate-600">
            Kembalian: <span className="font-semibold text-amber-600">Rp {Number(change).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
