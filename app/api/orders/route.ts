import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  getOrderNotificationEmails,
  isEmailConfigured,
  sendNotificationEmail,
} from "@/lib/email-notify"

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

    // Generate order number: NZO = New Zealand Order
    const orderNumber = `NZO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
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

    // Send admin email to your domains (pqshub@gmail.com, hello@skirting.co.nz)
    const adminEmails = getOrderNotificationEmails()
    if (isEmailConfigured() && adminEmails.length > 0) {
      const adminResult = await sendNotificationEmail({
        to: adminEmails,
        subject: `New Order: ${orderData.orderId} - ${orderData.customer.name}`,
        html: generateOrderEmail(orderData),
        from: process.env.EMAIL_FROM || "orders@skirting.co.nz",
      })
      if (!adminResult.ok) {
        console.error("Order notification email failed:", adminResult.error)
      }
    }

    // Send confirmation email to the customer who placed the order
    if (isEmailConfigured() && orderData.customer.email) {
      const customerResult = await sendNotificationEmail({
        to: orderData.customer.email.trim(),
        subject: `Order confirmation ${orderData.orderId} – Skirting`,
        html: generateCustomerOrderConfirmation(orderData),
        from: process.env.EMAIL_FROM || "orders@skirting.co.nz",
      })
      if (!customerResult.ok) {
        console.error("Customer order confirmation email failed:", customerResult.error)
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

function generateCustomerOrderConfirmation(orderData: any): string {
  const itemsHtml = orderData.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}${item.color ? ` (${item.color})` : ""}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.length}m × ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${typeof item.subtotal === "number" ? item.subtotal.toFixed(2) : "0.00"}</td>
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
          .container { max-width: 560px; margin: 0 auto; padding: 24px; }
          .header { background: #ff9f1c; color: #0d0d0d; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #1a1a1a; color: #fff; padding: 10px; text-align: left; font-size: 14px; }
          .total { font-size: 18px; font-weight: bold; color: #ff9f1c; margin-top: 8px; }
          .order-id { font-size: 18px; font-weight: bold; letter-spacing: 0.05em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0 0 8px 0;">Thank you for your order</h1>
            <p style="margin: 0; opacity: 0.9;">Order number: <span class="order-id">${orderData.orderId}</span></p>
          </div>
          <div class="content">
            <p>Kia ora ${orderData.customer.name},</p>
            <p>We've received your order and will be in touch regarding next steps.</p>
            <h2 style="font-size: 16px; margin: 20px 0 8px 0;">Order summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <p class="total">Total: $${orderData.total.toFixed(2)}</p>
            ${orderData.notes ? `<p><strong>Your notes:</strong> ${orderData.notes}</p>` : ""}
            <p style="margin-top: 24px; color: #666; font-size: 13px;">
              If you have any questions, reply to this email or contact us at hello@skirting.co.nz.
            </p>
            <p style="margin-top: 16px; color: #999; font-size: 12px;">
              Order placed: ${new Date(orderData.orderDate).toLocaleString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `
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
