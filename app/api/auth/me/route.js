import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { id: null, username: null, role: null },
        { status: 200 }
      )
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )

    return NextResponse.json({
      id: payload.id,
      username: payload.username,
      role: payload.role,
    })

  } catch (err) {
    return NextResponse.json(
      { id: null, username: null, role: null },
      { status: 200 }
    )
  }
}
