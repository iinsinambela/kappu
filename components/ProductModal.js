'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function ProductModal({
  open,
  onClose,
  onSuccess,
  editData,
  onCreate,
  onUpdate
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load data saat edit
  useEffect(() => {
    if (editData) {
      setName(editData.name ?? '')
      setPrice(String(editData.price ?? ''))
      setStock(String(editData.stock ?? ''))
      setDescription(editData.description ?? '')
      setImage(null)
    } else {
      setName('')
      setPrice('')
      setStock('')
      setDescription('')
      setImage(null)
    }
  }, [editData, open])

  if (!open) return null

  // ============================
  // SUBMIT FORM PRODUK
  // ============================
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const fd = new FormData()

      // Pastikan field selalu ada
      fd.append('name', name.trim())
      fd.append('price', price ? String(price) : '0')
      fd.append('stock', stock ? String(stock) : '0')
      fd.append('description', description ?? '')

      // Gambar opsional
      if (image) fd.append('image', image)

      let ok = false

      if (editData) {
        // Tambahkan override untuk PUT (beberapa server membaca ini)
        fd.append('_method', 'PUT')

        ok = await onUpdate(editData.id, fd)
      } else {
        ok = await onCreate(fd)
      }

      if (ok) {
        if (onSuccess) onSuccess()
        if (onClose) onClose()
      } else {
        alert('Gagal menyimpan produk')
      }
    } catch (err) {
      console.error('❌ ERROR ProductModal:', err)
      alert('Terjadi kesalahan saat menyimpan produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-50 w-[520px] bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {editData ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            className="w-full p-3 rounded-lg border bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 outline-none"
            placeholder="Nama Produk"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="p-3 rounded-lg border bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 outline-none"
              type="number"
              placeholder="Harga"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />

            <input
              className="p-3 rounded-lg border bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 outline-none"
              type="number"
              placeholder="Stok"
              value={stock}
              onChange={e => setStock(e.target.value)}
              required
            />
          </div>

          <textarea
            className="w-full p-3 rounded-lg border bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 outline-none"
            placeholder="Deskripsi (opsional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded-lg bg-white text-gray-800"
          />

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow transition"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
