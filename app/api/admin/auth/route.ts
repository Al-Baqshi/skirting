import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_PIN = process.env.ADMIN_PIN || "1234"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 })
    }

    if (pin === ADMIN_PIN) {
      // Set a secure cookie that expires in 24 hours
      const cookieStore = await cookies()
      cookieStore.set("admin_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
