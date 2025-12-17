import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      )
    }

    // convert file → buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // read excel
    const workbook = XLSX.read(buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    for (const row of rows) {
      await prisma.employee.create({
        data: {
          fullName: row.fullName?.toString() || "",
          position: row.position?.toString() || "",
          phone: row.phone?.toString() || "",
          salary: Number(row.salary) || 0,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("IMPORT ERROR:", error)
    return NextResponse.json(
      { error: "Gagal mengimport data" },
      { status: 500 }
    )
  }
}
