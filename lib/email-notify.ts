/**
 * Admin email notifications for orders and contact form submissions.
 * Set ADMIN_EMAIL (comma-separated for multiple) to receive both; or ORDER_NOTIFICATION_EMAIL and CONTACT_NOTIFICATION_EMAIL separately.
 * Requires: EMAIL_SERVICE=resend, RESEND_API_KEY, and EMAIL_FROM (verified domain in Resend).
 */

const RESEND_URL = "https://api.resend.com/emails"

const DEFAULT_NOTIFICATION_EMAILS = [
  "pqshub@gmail.com",
  "hello@skirting.co.nz",
]

function parseEmails(value: string | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

function firstNonEmpty(...values: (string | undefined)[]): string[] {
  for (const v of values) {
    const emails = parseEmails(v)
    if (emails.length > 0) return emails
  }
  return []
}

export function getOrderNotificationEmails(): string[] {
  const emails = firstNonEmpty(
    process.env.ADMIN_EMAIL,
    process.env.ORDER_NOTIFICATION_EMAIL
  )
  return emails.length > 0 ? emails : DEFAULT_NOTIFICATION_EMAILS
}

export function getContactNotificationEmails(): string[] {
  const emails = firstNonEmpty(
    process.env.ADMIN_EMAIL,
    process.env.CONTACT_NOTIFICATION_EMAIL,
    process.env.ORDER_NOTIFICATION_EMAIL
  )
  return emails.length > 0 ? emails : DEFAULT_NOTIFICATION_EMAILS
}

export function isEmailConfigured(): boolean {
  return (
    process.env.EMAIL_SERVICE === "resend" &&
    !!process.env.RESEND_API_KEY?.trim()
  )
}

export async function sendNotificationEmail(params: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email not configured" }
  }

  const apiKey = process.env.RESEND_API_KEY!.trim()
  const from =
    params.from ||
    process.env.EMAIL_FROM ||
    "notifications@skirting.co.nz"
  const to = Array.isArray(params.to) ? params.to : [params.to]

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: params.subject,
        html: params.html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Resend API error:", res.status, text)
      return { ok: false, error: text || `HTTP ${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    console.error("Email send error:", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
