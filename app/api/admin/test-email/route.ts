import { NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import {
  getOrderNotificationEmails,
  isEmailConfigured,
  sendNotificationEmail,
} from "@/lib/email-notify"

export async function POST() {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email not configured. Set EMAIL_SERVICE=resend, RESEND_API_KEY, and EMAIL_FROM in .env",
      },
      { status: 200 }
    )
  }

  const to = getOrderNotificationEmails()
  const result = await sendNotificationEmail({
    to,
    subject: "Test: Skirting order notifications",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ff9f1c;">Test email</h1>
        <p>If you received this, Resend is set up correctly and you will get an email when:</p>
        <ul>
          <li>A new order is placed</li>
          <li>A contact form is submitted</li>
        </ul>
        <p style="color: #666; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
      </div>
    `,
    from: process.env.EMAIL_FROM || "notifications@skirting.co.nz",
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Failed to send" },
      { status: 200 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: `Test email sent to ${to.join(", ")}`,
  })
}
