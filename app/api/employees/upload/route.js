import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

export const runtime = "nodejs"; // FIX

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      await prisma.employee.create({
        data: {
          fullName: row.fullName,
          position: row.position,
          phone: row.phone ?? null,
          salary: Number(row.salary) || 0,
          shiftId: row.shiftId ? Number(row.shiftId) : null,
        },
      });
    }

    return NextResponse.json({ message: "Upload berhasil" });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Gagal upload file" }, { status: 500 });
  }
}
