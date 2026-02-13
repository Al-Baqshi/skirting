import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  getContactNotificationEmails,
  isEmailConfigured,
  sendNotificationEmail,
} from "@/lib/email-notify"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Contact form submission endpoint
// Stores in Supabase database (primary) + optional webhook/email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, service, message } = body

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const fullName = `${firstName} ${lastName}`

    // Store in Supabase database (PRIMARY METHOD)
    const { data: inquiry, error: dbError } = await supabase
      .from("contact_inquiries")
      .insert({
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        service: service || "other",
        message: message || null,
        status: "new",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Failed to save inquiry. Please try again." },
        { status: 500 }
      )
    }

    // Prepare contact data for webhook/email (optional)
    const contactData = {
      contactId: inquiry.id,
      timestamp: inquiry.created_at,
      customer: {
        firstName,
        lastName,
        fullName,
        email,
        phone,
      },
      service: service || "other",
      message: message || "",
      status: "new",
    }

    // Send to webhook (n8n) if configured
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        })

        if (!webhookRes.ok) {
          console.error("Contact webhook failed:", await webhookRes.text())
          // Don't fail the request if webhook fails, just log it
        }
      } catch (webhookError) {
        console.error("Contact webhook error:", webhookError)
        // Continue even if webhook fails
      }
    }

    // Send admin email notification (Resend; recipients from ADMIN_EMAIL or CONTACT/ORDER_NOTIFICATION_EMAIL)
    const recipientEmails = getContactNotificationEmails()
    if (isEmailConfigured() && recipientEmails.length > 0) {
      const result = await sendNotificationEmail({
        to: recipientEmails,
        subject: `New Contact Form: ${contactData.customer.fullName} - ${contactData.service}`,
        html: generateContactEmail(contactData),
        from: process.env.EMAIL_FROM || "contact@skirting.co.nz",
      })
      if (!result.ok) {
        console.error("Contact notification email failed:", result.error)
      }
    }

    return NextResponse.json({
      success: true,
      contactId: inquiry.id,
      message: "Message submitted successfully",
    })
  } catch (err) {
    console.error("Contact submission error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function generateContactEmail(contactData: any): string {
  const serviceLabels: Record<string, string> = {
    quote: "Product Quote",
    installation: "Professional Installation",
    consultation: "Design Consultation",
    other: "Other Inquiry",
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9f1c; color: #0d0d0d; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; color: #1a1a1a; }
          .value { color: #333; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>Contact ID: ${contactData.contactId}</p>
          </div>
          <div class="content">
            <h2>Customer Information</h2>
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${contactData.customer.fullName}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${contactData.customer.email}">${contactData.customer.email}</a></div>
            </div>
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${contactData.customer.phone}">${contactData.customer.phone}</a></div>
            </div>
            <div class="field">
              <div class="label">Service:</div>
              <div class="value">${serviceLabels[contactData.service] || contactData.service}</div>
            </div>
            ${contactData.message ? `
            <div class="field">
              <div class="label">Message:</div>
              <div class="value" style="white-space: pre-wrap;">${contactData.message}</div>
            </div>
            ` : ""}
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Submitted: ${new Date(contactData.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
