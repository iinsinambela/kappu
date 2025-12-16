import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/bahan-baku",
  "/dashboard/laporan",
  "/dashboard/pegawai"
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Akses halaman login tetap boleh
  if (pathname === "/") return NextResponse.next();

  // Jika halaman membutuhkan login
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      // 🔒 Batasi akses pegawai
      if (pathname.startsWith("/dashboard/pegawai")) {
        if (payload.role !== "OWNER") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      return NextResponse.next();

    } catch (err) {
      console.error("JWT error:", err);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",   // Semua dashboard diproteksi
  ]
};
