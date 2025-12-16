'use client'

import { useEffect, useState } from 'react'

export default function ProdukPage() {
  const [products, setProducts] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [description, setDescription] = useState('')

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState(null)

  async function fetchProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function handleDelete(id) {
  if (!confirm('Hapus produk ini?')) return

  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })

  if (res.ok) {
    alert("Produk berhasil dihapus!")
    fetchProducts()
  } else {
    const txt = await res.text()
    alert("Gagal menghapus produk: " + txt)
  }
}

// bagian edit

  async function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', name)
    fd.append('price', price)
    fd.append('stock', stock)
    if (image) fd.append('image', image)

    const method = editData ? 'PUT' : 'POST'
    const url = editData ? `/api/products/${editData.id}` : '/api/products'

    const res = await fetch(url, { method, body: fd })
    if (res.ok) {
      alert(editData ? 'Produk diperbarui!' : 'Produk ditambahkan!')
      setFormOpen(false)
      setEditData(null)
      setName('')
      setPrice('')
      setStock('')
      setImage(null)
      fetchProducts()
    } else {
      const err = await res.json()
      alert(err.error || 'Gagal menyimpan')
    }
  }


  function openEdit(p) {
    setEditData(p)
    setName(p.name)
    setPrice(p.price)
    setStock(p.stock)
    setFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Kelola Produk</h1>
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 bg-amber-500 text-white rounded">
          + Tambah Produk
        </button>
      </div>

      <table className="w-full border-collapse border border-slate-300">
        <thead className="bg-slate-200 text-slate-700">
          <tr>
            <th className="p-2 border">Foto</th>
            <th className="p-2 border">Nama</th>
            <th className="p-2 border">Harga</th>
            <th className="p-2 border">Stok</th>
            <th className="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="text-center">
              <td className="border p-2">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded mx-auto" />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">Rp {Number(p.price).toLocaleString()}</td>
              <td className="border p-2">{p.stock}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => openEdit(p)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-lg w-[400px] space-y-3"
          >
            <h2 className="text-lg font-semibold mb-3">{editData ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Produk" className="w-full p-2 border rounded" />
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Harga" className="w-full p-2 border rounded" />
            <input value={stock} onChange={e => setStock(e.target.value)} placeholder="Stok" className="w-full p-2 border rounded" />
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />

            <div className="flex justify-end space-x-2 pt-3">
              <button type="button" onClick={() => setFormOpen(false)} className="px-3 py-1 border rounded">Batal</button>
              <button type="submit" className="px-3 py-1 bg-amber-500 text-white rounded">
                {editData ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
