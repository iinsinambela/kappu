'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Search, X, Upload } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function BahanBakuPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', unit: '', stock: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // 📌 Ref untuk upload Excel
  const uploadRef = useRef(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  async function fetchMaterials() {
    setLoading(true)
    const res = await fetch(`/api/materials?q=${encodeURIComponent(search)}`)
    const data = await res.json()
    setMaterials(data)
    setLoading(false)
  }

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', unit: '', stock: '', price: '' })
    setModalOpen(true)
  }

  function openEdit(mat) {
    setEditItem(mat)
    setForm({
      name: mat.name,
      unit: mat.unit,
      stock: mat.stock,
      price: mat.costPerUnit,
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const method = editItem ? 'PUT' : 'POST'
    const url = editItem ? `/api/materials/${editItem.id}` : '/api/materials'

    const payload = {
      name: form.name,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      price: Number(form.price) || 0,
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setModalOpen(false)
      fetchMaterials()
    } else {
      alert('Gagal menyimpan data')
    }

    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Yakin hapus bahan baku ini?')) return
    await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    fetchMaterials()
  }

  // 📌 Fungsi Import Excel
  async function handleUploadExcel(e) {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/materials/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      alert('Berhasil upload file!')
      fetchMaterials()
    } else {
      alert('Gagal upload file!')
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Kelola Stok</h1>

            {/* 📌 Tombol Upload Excel + Tambah */}
            <div className="flex gap-3">

              <button
                onClick={() => uploadRef.current.click()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-all"
              >
                <Upload size={18} /> Upload Excel
              </button>

              <input
                type="file"
                ref={uploadRef}
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleUploadExcel}
              />

              <button
                onClick={openAdd}
                className="bg-red-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-all"
              >
                <Plus size={18} /> Tambah
              </button>
            </div>

          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              placeholder="Cari bahan baku..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchMaterials()}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none transition"
            />
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-20">Memuat data bahan baku...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-amber-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-left">Nama Bahan</th>
                    <th className="py-3 px-4 text-left">Satuan</th>
                    <th className="py-3 px-4 text-right">Stok</th>
                    <th className="py-3 px-4 text-right">Harga/Satuan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(mat => (
                    <tr key={mat.id} className="border-b hover:bg-amber-50 transition">
                      <td className="py-3 px-4 text-slate-800">{mat.name}</td>
                      <td className="py-3 px-4 text-slate-600">{mat.unit}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{mat.stock}</td>
                      <td className="py-3 px-4 text-right text-amber-600 font-medium">
                        Rp {Number(mat.costPerUnit).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(mat)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {materials.length === 0 && (
                <div className="text-center text-slate-400 py-6">Tidak ada bahan baku</div>
              )}

            </div>
          )}
        </div>
      </main>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleSave}
            className="bg-gradient-to-br from-white/95 to-slate-50/90 rounded-2xl shadow-2xl p-8 w-[480px] border border-slate-200 space-y-5 transition-all animate-fadeIn"
          >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-800 tracking-wide">
                {editItem ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-red-500 transition"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Nama Bahan</span>
                <input
                  placeholder="Contoh: Gula, Kopi Bubuk"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Satuan</span>
                <input
                  placeholder="Contoh: Kg, Liter, Pcs"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Stok</span>
                <input
                  type="number"
                  placeholder="Jumlah stok saat ini"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Harga per Satuan (Rp)</span>
                <input
                  type="number"
                  placeholder="Harga pembelian"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium"
              >
                Batal
              </button>
              <button
                disabled={saving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow transition-all"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
