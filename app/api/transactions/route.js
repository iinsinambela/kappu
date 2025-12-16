import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { cart, paidAmount } = await req.json()
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })
    }

    // 🔐 Ambil token user dari cookie (kasir)
    const token = req.cookies.get('token')?.value
    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.id
      } catch (err) {
        console.warn('Token invalid, transaksi tetap dilanjut tanpa user.')
      }
    }

    // 🔢 Hitung total
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const changeAmount = paidAmount - totalAmount

    // 🧾 Buat invoice unik
    const invoiceNo = `INV-${Date.now()}`

    // 🧮 Simpan transaksi utama
    const transaction = await prisma.transaction.create({
      data: {
        invoiceNo,
        userId,
        totalAmount,
        paidAmount,
        changeAmount,
        status: 'COMPLETED',
      },
    })

    // 🧩 Simpan item transaksi + kurangi stok produk
    for (const item of cart) {
      await prisma.transactionItem.create({
        data: {
          transactionId: transaction.id,
          productId: item.id,
          qty: item.qty,
          unitPrice: item.price,
          subtotal: item.price * item.qty,
        },
      })

      // Kurangi stok produk
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.qty } },
      })
    }

    return NextResponse.json({
      message: 'Transaksi berhasil disimpan',
      invoiceNo,
      changeAmount,
    })
  } catch (error) {
    console.error('❌ Gagal menyimpan transaksi:', error)
    return NextResponse.json({ error: 'Gagal menyimpan transaksi' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        items: { include: { product: true } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('❌ Gagal mengambil transaksi:', error)
    return NextResponse.json({ error: 'Gagal mengambil transaksi' }, { status: 500 })
  }
}
