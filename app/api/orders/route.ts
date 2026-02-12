import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Order submission endpoint
// Stores in Supabase database (primary) + optional webhook/email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, total, orderDate } = body

    // Validation
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return NextResponse.json({ error: "Missing required customer information" }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const totalAmount = parseFloat(total)

    // Prepare items for storage (include color when present for quote)
    const orderItems = items.map((item: { productName?: string; productSlug?: string; price?: number; length?: number; quantity?: number; subtotal?: number; color?: string }) => ({
      productName: item.productName,
      productSlug: item.productSlug,
      price: item.price,
      length: item.length,
      quantity: item.quantity,
      subtotal: item.subtotal,
      color: item.color ?? null,
    }))

    // Store in Supabase database (PRIMARY METHOD)
    const { data: order, error: dbError } = await supabase
      .from("guest_orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone.trim(),
        customer_address: customer.address || null,
        customer_city: customer.city || null,
        customer_postal_code: customer.postalCode || null,
        customer_notes: customer.notes || null,
        total_amount: totalAmount,
        items: orderItems,
        status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Failed to save order. Please try again." },
        { status: 500 }
      )
    }

    // Prepare order data for webhook/email (optional)
    const orderData = {
      orderId: order.order_number,
      orderDate: order.created_at,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || "",
        city: customer.city || "",
        postalCode: customer.postalCode || "",
      },
      items: orderItems,
      total: totalAmount,
      notes: customer.notes || "",
      status: "pending",
    }

    // Send to webhook (n8n) if configured
    const webhookUrl = process.env.ORDER_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        })

        if (!webhookRes.ok) {
          console.error("Webhook failed:", await webhookRes.text())
          // Don't fail the request if webhook fails, just log it
        }
      } catch (webhookError) {
        console.error("Webhook error:", webhookError)
        // Continue even if webhook fails
      }
    }

    // Send email if configured (using Resend, SendGrid, etc.)
    const emailService = process.env.EMAIL_SERVICE
    const recipientEmail = process.env.ORDER_NOTIFICATION_EMAIL

    if (emailService === "resend" && recipientEmail) {
      try {
        const resendApiKey = process.env.RESEND_API_KEY
        if (resendApiKey) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "orders@innovationskirting.co.nz",
              to: recipientEmail,
              subject: `New Order: ${orderData.orderId} - ${orderData.customer.name}`,
              html: generateOrderEmail(orderData),
            }),
          })
        }
      } catch (emailError) {
        console.error("Email error:", emailError)
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.order_number,
      message: "Order submitted successfully",
    })
  } catch (err) {
    console.error("Order submission error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function generateOrderEmail(orderData: any): string {
  const itemsHtml = orderData.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}${item.color ? ` (${item.color})` : ""}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.length}m</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${typeof item.price === "number" ? item.price.toFixed(2) : "0.00"}/m</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${typeof item.subtotal === "number" ? item.subtotal.toFixed(2) : "0.00"}</td>
    </tr>
  `
    )
    .join("")

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
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1a1a1a; color: #fff; padding: 12px; text-align: left; }
          .total { font-size: 20px; font-weight: bold; color: #ff9f1c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received</h1>
            <p>Order ID: ${orderData.orderId}</p>
          </div>
          <div class="content">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> ${orderData.customer.name}</p>
            <p><strong>Email:</strong> ${orderData.customer.email}</p>
            <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
            <p><strong>Address:</strong> ${orderData.customer.address}, ${orderData.customer.city} ${orderData.customer.postalCode}</p>
            
            <h2>Order Items</h2>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Length</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <p class="total">Total: $${orderData.total.toFixed(2)}</p>
            
            ${orderData.notes ? `<p><strong>Notes:</strong> ${orderData.notes}</p>` : ""}
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Order Date: ${new Date(orderData.orderDate).toLocaleString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
