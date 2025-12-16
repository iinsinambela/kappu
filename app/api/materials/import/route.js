import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import * as XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req) {
  try {
    const { files } = await parseForm(req);

    const file = files.file[0];

    const workbook = XLSX.readFile(file.filepath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      await prisma.rawMaterial.create({
        data: {
          code: row.code || null,
          name: row.name || "",
          unit: row.unit || "pcs",
          stock: Number(row.stock) || 0,
          costPerUnit: Number(row.costPerUnit) || 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    return NextResponse.json({ error: "Gagal mengimport data" }, { status: 500 });
  }
}
