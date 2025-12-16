'use client'

import { Pencil, Trash2 } from 'lucide-react'

export default function ProductGrid({ products = [], onAdd, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow-md border hover:shadow-lg transition p-4">
          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
            {p.imageUrl ? (
              // use plain img to avoid next/image build issues in dev server
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 truncate">{p.name}</h3>
          <p className="text-gray-600">Rp {Number(p.price).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Stok: {p.stock}</p>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => onAdd && onAdd(p)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Tambah
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit && onEdit(p)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                title="Edit"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => onDelete && onDelete(p.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
