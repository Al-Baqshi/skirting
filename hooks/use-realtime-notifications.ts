"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { playNotificationSound } from "@/lib/notification-sound"

type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  created_at: string
}

type Inquiry = {
  id: string
  full_name: string
  email: string
  service: string
  created_at: string
}

interface UseRealtimeNotificationsOptions {
  onNewOrder?: (order: Order) => void
  onNewInquiry?: (inquiry: Inquiry) => void
  enabled?: boolean
}

/**
 * Hook to listen for new orders and contact inquiries via Supabase Realtime
 */
export function useRealtimeNotifications({
  onNewOrder,
  onNewInquiry,
  enabled = true,
}: UseRealtimeNotificationsOptions = {}) {
  const hasInitialized = useRef(false)
  const ordersChannelRef = useRef<any>(null)
  const inquiriesChannelRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled || hasInitialized.current) return

    hasInitialized.current = true

    // Subscribe to new orders
    const ordersChannel = supabase
      .channel("new-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guest_orders",
        },
        (payload) => {
          try {
            const newOrder = payload.new as Order
            
            // Play notification sound
            playNotificationSound()
            
            // Show toast notification
            toast.success("New Order Received! 🛒", {
              description: `Order #${newOrder.order_number} from ${newOrder.customer_name} - $${newOrder.total_amount.toFixed(2)}`,
              duration: 5000,
              action: {
                label: "View",
                onClick: () => {
                  // Scroll to orders tab or refresh
                  window.location.hash = "#orders"
                },
              },
            })

            // Call custom callback if provided
            onNewOrder?.(newOrder)
          } catch (error) {
            console.error("Error handling new order notification:", error)
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Listening for new orders...")
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to orders channel")
        }
      })

    ordersChannelRef.current = ordersChannel

    // Subscribe to new contact inquiries
    const inquiriesChannel = supabase
      .channel("new-inquiries")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_inquiries",
        },
        (payload) => {
          try {
            const newInquiry = payload.new as Inquiry
            
            // Play notification sound
            playNotificationSound()
            
            // Show toast notification
            toast.success("New Contact Inquiry! 📧", {
              description: `${newInquiry.full_name} - ${newInquiry.service}`,
              duration: 5000,
              action: {
                label: "View",
                onClick: () => {
                  // Scroll to inquiries tab
                  window.location.hash = "#inquiries"
                },
              },
            })

            // Call custom callback if provided
            onNewInquiry?.(newInquiry)
          } catch (error) {
            console.error("Error handling new inquiry notification:", error)
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Listening for new inquiries...")
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to inquiries channel")
        }
      })

    inquiriesChannelRef.current = inquiriesChannel

    // Cleanup subscriptions on unmount
    return () => {
      if (ordersChannelRef.current) {
        ordersChannelRef.current.unsubscribe()
      }
      if (inquiriesChannelRef.current) {
        inquiriesChannelRef.current.unsubscribe()
      }
      hasInitialized.current = false
    }
  }, [enabled, onNewOrder, onNewInquiry])
}
