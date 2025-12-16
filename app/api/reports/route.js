import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { subDays, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // ✅ Total omzet & transaksi
    const transaksi = await prisma.transaction.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    const totalOmzet = transaksi.reduce((sum, t) => sum + Number(t.totalAmount), 0)
    const totalTransaksi = transaksi.length
    const avgPerTransaksi = totalTransaksi > 0 ? totalOmzet / totalTransaksi : 0

    // ✅ Nilai stok bahan baku
    const bahan = await prisma.rawMaterial.findMany()
    const totalStockValue = bahan.reduce(
      (sum, b) => sum + Number(b.stock) * Number(b.costPerUnit || 0),
      0
    )

    // ✅ Chart 7 hari terakhir
    const sevenDaysAgo = subDays(new Date(), 6)
    const chartData = []

    for (let i = 0; i < 7; i++) {
      const date = subDays(new Date(), i)
      const formattedDate = format(date, 'dd MMM', { locale: idLocale })

      const dailyTotal = transaksi
        .filter((t) => new Date(t.createdAt).toDateString() === date.toDateString())
        .reduce((sum, t) => sum + Number(t.totalAmount), 0)

      chartData.unshift({ date: formattedDate, total: dailyTotal })
    }

    // ✅ Transaksi terakhir
    const recentTransactions = transaksi.slice(0, 10)

    return NextResponse.json({
      summary: {
        totalOmzet,
        totalTransaksi,
        avgPerTransaksi,
        totalStockValue,
      },
      chartData,
      recentTransactions,
    })
  } catch (error) {
    console.error('❌ Error generating report:', error)
    return NextResponse.json({ error: 'Gagal mengambil laporan' }, { status: 500 })
  }
}
