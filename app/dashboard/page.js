'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import ProductGrid from '@/components/ProductGrid'
import POSForm from '@/components/POSForm'
import ProductModal from '@/components/ProductModal'

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  // modal state
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState(null)

  // Fetch product on load
  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Gagal memuat produk')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    }
  }

  // CART FUNCTIONS
  function addToCart(product) {
    setCart(prev => {
      const e = prev.find(i => i.id === product.id)
      if (e) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  function updateQty(id, qty) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  // CHECKOUT
  async function handleCheckout(paidAmount) {
    if (cart.length === 0) {
      alert('Keranjang kosong!')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, paidAmount }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout gagal')

      alert(`Transaksi sukses! Invoice: ${data.invoiceNo}`)
      setCart([])
      fetchProducts() // refresh stok

    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // CRUD PRODUK
  async function handleCreateProduct(formData) {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Gagal menambah produk')

      await fetchProducts()
      return true

    } catch (err) {
      console.error(err)
      return false
    }
  }

  async function handleUpdateProduct(id, formData) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) throw new Error('Gagal update produk')

      await fetchProducts()
      return true

    } catch (err) {
      console.error(err)
      return false
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Gagal menghapus produk')

      await fetchProducts()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus produk')
    }
  }

  // OPEN MODAL TAMBAH
  function openCreateModal() {
    setEditData(null)
    setOpenModal(true)
  }

  // OPEN MODAL EDIT
  function openEditModal(product) {
    setEditData(product)
    setOpenModal(true)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="flex-1 p-6">
        <Topbar />

        {/* MODAL PRODUK */}
        <ProductModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSuccess={fetchProducts}
          editData={editData}
          onCreate={handleCreateProduct}
          onUpdate={handleUpdateProduct}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PRODUK */}
          <section className="md:col-span-2">
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-semibold text-slate-700">
                Daftar Produk
              </h2>
              <button
                onClick={openCreateModal}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
              >
                + Tambah Produk
              </button>
            </div>

            <ProductGrid
              products={products}
              onAdd={addToCart}
              onEdit={openEditModal}
              onDelete={handleDeleteProduct}
            />
          </section>

          {/* POS FORM */}
          <aside className="md:col-span-1">
            <POSForm
              cart={cart}
              onRemove={removeFromCart}
              onUpdateQty={updateQty}
              onCheckout={handleCheckout}
              loading={loading}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}
