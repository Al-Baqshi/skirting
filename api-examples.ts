// ============================================================================
// EXAMPLE API ROUTE IMPLEMENTATIONS
// ============================================================================
// These are examples showing how to implement the API endpoints
// Copy and adapt these for your Next.js API routes
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client (bypasses RLS - use carefully!)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  
  if (error || !user) return null
  return user
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return data?.role === 'admin'
}

// ============================================================================
// EXAMPLE: Get Products with User's Effective Price
// ============================================================================

export async function GET_PRODUCTS_WITH_PRICE(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('id')

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  // Get product
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Get effective price if user is logged in
  let effectivePrice = product.price
  let isCustomPrice = false
  let discountApplied = 0

  if (user) {
    // Check for custom pricing
    const { data: customPrice } = await supabaseAdmin
      .from('user_product_prices')
      .select('custom_price')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .gte('min_quantity', 1)
      .or('valid_until.is.null,valid_until.gt.' + new Date().toISOString())
      .order('min_quantity', { ascending: false })
      .limit(1)
      .single()

    if (customPrice) {
      effectivePrice = customPrice.custom_price
      isCustomPrice = true
    } else {
      // Get user discount
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('default_discount_percent')
        .eq('id', user.id)
        .single()

      if (profile?.default_discount_percent) {
        discountApplied = profile.default_discount_percent
        effectivePrice = product.price * (1 - discountApplied / 100)
      }
    }
  }

  return NextResponse.json({
    ...product,
    price: product.price, // Base price
    effectivePrice: Math.round(effectivePrice * 100) / 100,
    isCustomPrice,
    discountApplied,
  })
}

// ============================================================================
// EXAMPLE: Add to Cart
// ============================================================================

export async function POST_ADD_TO_CART(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { product_id, quantity = 1, length = 1.0 } = body

  if (!product_id) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  // Get effective price
  const { data: priceResult } = await supabaseAdmin.rpc('get_effective_price', {
    p_user_id: user.id,
    p_product_id: product_id,
    p_quantity: quantity,
  })

  const unitPrice = priceResult || 0

  // Add or update cart item
  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .upsert({
      user_id: user.id,
      product_id,
      quantity,
      length,
      unit_price: unitPrice,
      subtotal: quantity * length * unitPrice,
    }, {
      onConflict: 'user_id,product_id',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, item: data })
}

// ============================================================================
// EXAMPLE: Get Cart
// ============================================================================

export async function GET_CART(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: cartItems, error } = await supabaseAdmin
    .from('cart_items')
    .select(`
      *,
      products (
        id,
        name,
        image,
        slug
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = cartItems?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0

  return NextResponse.json({
    items: cartItems,
    total: Math.round(total * 100) / 100,
    itemCount: cartItems?.length || 0,
  })
}

// ============================================================================
// EXAMPLE: Create Order from Cart
// ============================================================================

export async function POST_CREATE_ORDER(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    shipping_address,
    billing_address,
    payment_method = 'credit_card',
    customer_notes,
  } = body

  // Get cart items
  const { data: cartItems, error: cartError } = await supabaseAdmin
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', user.id)

  if (cartError || !cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Get user profile for discount
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('default_discount_percent')
    .eq('id', user.id)
    .single()

  const discountPercent = profile?.default_discount_percent || 0

  // Calculate totals
  let subtotal = 0
  const orderItems = []

  for (const item of cartItems) {
    const lineTotal = item.quantity * item.length * item.unit_price * (1 - discountPercent / 100)
    subtotal += lineTotal

    orderItems.push({
      product_id: item.product_id,
      product_name: item.products.name,
      product_image: item.products.image,
      quantity: item.quantity,
      length: item.length,
      unit_price: item.unit_price,
      discount_percent: discountPercent,
      line_total: Math.round(lineTotal * 100) / 100,
    })
  }

  const discountAmount = subtotal * (discountPercent / 100)
  const taxRate = 0.15 // 15% GST in NZ
  const taxAmount = (subtotal - discountAmount) * taxRate
  const shippingAmount = 0 // Calculate based on your shipping rules
  const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      subtotal: Math.round(subtotal * 100) / 100,
      discount_amount: Math.round(discountAmount * 100) / 100,
      discount_percent: discountPercent,
      tax_amount: Math.round(taxAmount * 100) / 100,
      tax_rate: taxRate,
      shipping_amount: shippingAmount,
      total_amount: Math.round(totalAmount * 100) / 100,
      shipping_name: shipping_address.name,
      shipping_company: shipping_address.company,
      shipping_address_line1: shipping_address.line1,
      shipping_address_line2: shipping_address.line2,
      shipping_city: shipping_address.city,
      shipping_state: shipping_address.state,
      shipping_postal_code: shipping_address.postal_code,
      shipping_country: shipping_address.country || 'New Zealand',
      shipping_phone: shipping_address.phone,
      billing_name: billing_address?.name || shipping_address.name,
      billing_company: billing_address?.company || shipping_address.company,
      billing_address_line1: billing_address?.line1 || shipping_address.line1,
      billing_address_line2: billing_address?.line2 || shipping_address.line2,
      billing_city: billing_address?.city || shipping_address.city,
      billing_state: billing_address?.state || shipping_address.state,
      billing_postal_code: billing_address?.postal_code || shipping_address.postal_code,
      billing_country: billing_address?.country || shipping_address.country || 'New Zealand',
      payment_method,
      customer_notes,
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  // Create order items
  const orderItemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItemsWithOrderId)

  if (itemsError) {
    // Rollback order if items fail
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Clear cart
  await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id)

  return NextResponse.json({
    success: true,
    order: {
      ...order,
      items: orderItems,
    },
  })
}

// ============================================================================
// EXAMPLE: Get User Orders
// ============================================================================

export async function GET_USER_ORDERS(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_name,
        product_image,
        quantity,
        length,
        unit_price,
        line_total
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: orders || [] })
}

// ============================================================================
// EXAMPLE: Admin - Set Custom Price
// ============================================================================

export async function POST_ADMIN_SET_PRICE(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { user_id, product_id, custom_price, min_quantity = 1, valid_until } = body

  if (!user_id || !product_id || !custom_price) {
    return NextResponse.json(
      { error: 'user_id, product_id, and custom_price required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('user_product_prices')
    .upsert({
      user_id,
      product_id,
      custom_price,
      min_quantity,
      valid_until: valid_until || null,
    }, {
      onConflict: 'user_id,product_id',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, price: data })
}

// ============================================================================
// EXAMPLE: Admin - Get Dashboard Stats
// ============================================================================

export async function GET_ADMIN_STATS(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('admin_dashboard_stats')
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
