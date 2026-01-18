import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminAuth } from "@/lib/admin-auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// PATCH - Update inquiry status
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
    const { status, adminNotes } = body

    const updateData: any = {}

    if (status) {
      if (!["new", "contacted", "resolved", "archived"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = status
      
      // Update timestamp based on status
      if (status === "contacted" && !updateData.contacted_at) {
        updateData.contacted_at = new Date().toISOString()
      } else if (status === "resolved" && !updateData.resolved_at) {
        updateData.resolved_at = new Date().toISOString()
      }
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes
    }

    const { data: inquiry, error } = await supabase
      .from("contact_inquiries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ inquiry })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
