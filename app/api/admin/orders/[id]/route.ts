import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { isEmailConfigured, sendNotificationEmail } from "@/lib/email-notify"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const VALID_STATUSES = ["pending", "contacted", "confirmed", "processing", "shipped", "delivered", "cancelled"]
const VALID_PAYMENT_STATUSES = ["unpaid", "partial", "paid"]

function formatPaymentDate(v: string | null | undefined): string | null {
  if (!v || typeof v !== "string") return null
  const trimmed = v.trim()
  if (!trimmed) return null
  const d = new Date(trimmed)
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function generateOrderUpdateEmail(order: {
  order_number: string
  customer_name: string
  customer_email: string
  status: string
  total_amount: number
  items: any[]
  payment_status?: string | null
  amount_paid?: number | null
  payment_method?: string | null
  transaction_reference?: string | null
  payment_date?: string | null
  payment_notes?: string | null
}): string {
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    contacted: "Contacted",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }
  const paymentLabels: Record<string, string> = {
    unpaid: "Unpaid",
    partial: "Partially paid",
    paid: "Paid in full",
  }
  const statusLabel = statusLabels[order.status] || order.status
  const paymentStatus = order.payment_status || "unpaid"
  const paymentLabel = paymentLabels[paymentStatus] || paymentStatus

  let paymentSection = ""
  if (order.payment_status && order.payment_status !== "unpaid") {
    paymentSection = `
      <h2 style="font-size: 16px; margin: 20px 0 8px 0;">Payment</h2>
      <div style="background: #f0f0f0; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <p style="margin: 0 0 6px 0;"><strong>Status:</strong> ${paymentLabel}</p>
        ${order.amount_paid != null ? `<p style="margin: 0 0 6px 0;"><strong>Amount paid:</strong> $${Number(order.amount_paid).toFixed(2)}</p>` : ""}
        ${order.payment_method ? `<p style="margin: 0 0 6px 0;"><strong>Method:</strong> ${order.payment_method}</p>` : ""}
        ${order.transaction_reference ? `<p style="margin: 0 0 6px 0;"><strong>Transaction / reference:</strong> ${order.transaction_reference}</p>` : ""}
        ${order.payment_date ? `<p style="margin: 0 0 6px 0;"><strong>Date:</strong> ${new Date(order.payment_date).toLocaleDateString("en-NZ")}</p>` : ""}
        ${order.payment_notes ? `<p style="margin: 0;"><strong>Note:</strong> ${order.payment_notes}</p>` : ""}
      </div>
    `
  }

  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName || "Item"}${item.color ? ` (${item.color})` : ""}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.length}m × ${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">$${typeof item.subtotal === "number" ? item.subtotal.toFixed(2) : "0.00"}</td>
    </tr>
  `
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
          <div style="background: #ff9f1c; color: #0d0d0d; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0 0 8px 0;">Order update</h1>
            <p style="margin: 0; opacity: 0.9;">Order: <strong>${order.order_number}</strong></p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Kia ora ${order.customer_name},</p>
            <p>Your order status has been updated.</p>
            <p><strong>Status:</strong> ${statusLabel}</p>
            ${paymentSection}
            <h2 style="font-size: 16px; margin: 20px 0 8px 0;">Order summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #1a1a1a; color: #fff;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: left;">Qty</th>
                  <th style="padding: 10px; text-align: left;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <p style="font-size: 18px; font-weight: bold; color: #ff9f1c;">Total: $${Number(order.total_amount).toFixed(2)}</p>
            <p style="margin-top: 24px; color: #666; font-size: 13px;">Questions? Reply to this email or contact hello@skirting.co.nz.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// PATCH - Update order status and/or payment; send customer email on update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const {
      status,
      adminNotes,
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      transaction_reference: transactionReference,
      payment_date: paymentDate,
      payment_notes: paymentNotes,
    } = body

    const updateData: Record<string, unknown> = {}

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = status
      if (status === "contacted") updateData.contacted_at = new Date().toISOString()
      else if (status === "confirmed") updateData.confirmed_at = new Date().toISOString()
      else if (status === "shipped") updateData.shipped_at = new Date().toISOString()
      else if (status === "delivered") updateData.delivered_at = new Date().toISOString()
    }

    if (adminNotes !== undefined) updateData.admin_notes = adminNotes

    if (paymentStatus !== undefined) {
      const v = paymentStatus && String(paymentStatus).trim()
      if (v && !VALID_PAYMENT_STATUSES.includes(v)) {
        return NextResponse.json({ error: "Invalid payment_status" }, { status: 400 })
      }
      updateData.payment_status = v || "unpaid"
    }
    if (amountPaid !== undefined) {
      const n = Number(amountPaid)
      updateData.amount_paid = Number.isFinite(n) ? n : null
    }
    if (paymentMethod !== undefined) updateData.payment_method = paymentMethod || null
    if (transactionReference !== undefined) updateData.transaction_reference = transactionReference || null
    const normalizedDate = formatPaymentDate(paymentDate)
    if (paymentDate !== undefined) updateData.payment_date = normalizedDate
    if (paymentNotes !== undefined) updateData.payment_notes = paymentNotes || null

    const { data: order, error } = await supabase
      .from("guest_orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send order update email to customer when status or payment was updated (not for admin-notes-only)
    const statusOrPaymentUpdate = !!(
      status ||
      paymentStatus !== undefined ||
      amountPaid !== undefined ||
      paymentMethod !== undefined ||
      transactionReference !== undefined ||
      paymentDate !== undefined ||
      paymentNotes !== undefined
    )
    if (statusOrPaymentUpdate && order?.customer_email && isEmailConfigured()) {
      const statusWord = (order.status || "").charAt(0).toUpperCase() + (order.status || "").slice(1)
      const emailResult = await sendNotificationEmail({
        to: order.customer_email,
        subject: `Order ${order.order_number} – ${statusWord}`,
        html: generateOrderUpdateEmail(order),
        from: process.env.EMAIL_FROM || "orders@skirting.co.nz",
      })
      if (!emailResult.ok) {
        console.error("Order update email failed:", emailResult.error)
      }
    }

    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
