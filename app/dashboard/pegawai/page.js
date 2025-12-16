'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Edit, Trash2, Search, X, Upload } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function PegawaiPage() {
  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    position: '',
    phone: '',
    salary: '',
    shiftId: '',
  })

  // 📌 Ref untuk upload file
  const uploadRef = useRef(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [empRes, shiftRes] = await Promise.all([
        fetch(`/api/employees?q=${encodeURIComponent(search)}`),
        fetch('/api/shifts'),
      ])
      const empData = await empRes.json()
      const shiftData = await shiftRes.json()
      setEmployees(empData)
      setShifts(shiftData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditItem(null)
    setForm({
      fullName: '',
      position: '',
      phone: '',
      salary: '',
      shiftId: '',
    })
    setModalOpen(true)
  }

  function openEdit(emp) {
    setEditItem(emp)
    setForm({
      fullName: emp.fullName ?? '',
      position: emp.position ?? '',
      phone: emp.phone ?? '',
      salary: emp.salary ? String(emp.salary) : '',
      shiftId: emp.shift ? String(emp.shift.id) : '',
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      fullName: form.fullName,
      position: form.position,
      phone: form.phone,
      salary: Number(form.salary) || 0,
      shiftId: form.shiftId ? Number(form.shiftId) : null,
    }

    const method = editItem ? 'PUT' : 'POST'
    const url = editItem ? `/api/employees/${editItem.id}` : '/api/employees'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Gagal menyimpan data pegawai')
      } else {
        setModalOpen(false)
        await fetchAll()
      }
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan data pegawai')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin hapus pegawai ini?')) return
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        alert('Gagal menghapus pegawai')
      } else {
        await fetchAll()
      }
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus pegawai')
    }
  }

  // 📌 Fungsi upload Excel
  async function handleUploadExcel(e) {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/employees/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      alert('Berhasil upload file!')
      fetchAll()
    } else {
      alert('Gagal upload file!')
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Kelola Pegawai</h1>
              <p className="text-sm text-slate-500 mt-1">
                Tambah, edit, dan atur shift pegawai KAPPU.
              </p>
            </div>

            {/* 📌 Tombol Upload Excel + Tambah Pegawai */}
            <div className="flex gap-3">

              <button
                onClick={() => uploadRef.current.click()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-all"
              >
                <Upload size={18} /> Upload Excel
              </button>

              <input
                ref={uploadRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleUploadExcel}
              />

              <button
                onClick={openAdd}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-all"
              >
                <Plus size={18} /> Tambah Pegawai
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              placeholder="Cari pegawai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAll()}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/70 border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none transition"
            />
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-20">
              Memuat data pegawai...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-amber-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-left">Nama</th>
                    <th className="py-3 px-4 text-left">Posisi</th>
                    <th className="py-3 px-4 text-left">Shift</th>
                    <th className="py-3 px-4 text-left">Telepon</th>
                    <th className="py-3 px-4 text-right">Gaji</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b hover:bg-amber-50 transition">
                      <td className="py-3 px-4 text-slate-800">{emp.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{emp.position}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {emp.shift
                          ? `${emp.shift.name} (${emp.shift.startTime}–${emp.shift.endTime})`
                          : <span className="text-slate-400 text-sm">Belum di-set</span>
                        }
                      </td>
                      <td className="py-3 px-4 text-slate-600">{emp.phone || '-'}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                        Rp {Number(emp.salary).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {employees.length === 0 && (
                <div className="text-center text-slate-400 py-6">
                  Belum ada pegawai.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL FORM TAMBAH/EDIT PEGAWAI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleSave}
            className="bg-gradient-to-br from-white/95 to-slate-50/90 rounded-2xl shadow-2xl p-8 w-[520px] border border-slate-200 space-y-5 transition-all"
          >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-800 tracking-wide">
                {editItem ? 'Edit Pegawai' : 'Tambah Pegawai'}
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
                <span className="text-sm font-medium text-slate-600">Nama Lengkap</span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                  placeholder="Nama pegawai"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Posisi</span>
                <input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                  placeholder="Contoh: Barista, Kasir"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Nomor Telepon</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                  placeholder="Opsional"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Gaji (Rp)</span>
                <input
                  type="number"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 outline-none transition"
                  placeholder="Contoh: 2500000"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Shift Kerja</span>
                <select
                  value={form.shiftId}
                  onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none transition"
                >
                  <option value="">Pilih Shift</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime}–{s.endTime})
                    </option>
                  ))}
                </select>
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
