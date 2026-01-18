"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminAuth } from "@/components/admin-auth"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"

type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string | null
  customer_city: string | null
  customer_postal_code: string | null
  customer_notes: string | null
  status: string
  total_amount: number
  items: any[]
  admin_notes: string | null
  created_at: string
  contacted_at: string | null
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
}

type Inquiry = {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  service: string
  message: string | null
  status: string
  admin_notes: string | null
  created_at: string
  contacted_at: string | null
  resolved_at: string | null
}

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"orders" | "inquiries">("orders")
  const [selectedItem, setSelectedItem] = useState<Order | Inquiry | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [statusForm, setStatusForm] = useState({
    status: "",
    adminNotes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  // Set up real-time notifications for new orders and inquiries
  useRealtimeNotifications({
    onNewOrder: (newOrder) => {
      // Reload data to show the new order
      loadData()
      // Switch to orders tab if not already there
      setActiveTab("orders")
    },
    onNewInquiry: (newInquiry) => {
      // Reload data to show the new inquiry
      loadData()
      // Switch to inquiries tab if not already there
      setActiveTab("inquiries")
    },
    enabled: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersRes, inquiriesRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/inquiries"),
      ])

      const ordersData = await ordersRes.json()
      const inquiriesData = await inquiriesRes.json()

      if (ordersRes.ok) {
        setOrders(ordersData.orders || [])
      }
      if (inquiriesRes.ok) {
        setInquiries(inquiriesData.inquiries || [])
      }
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, type: "order" | "inquiry") => {
    if (!statusForm.status) {
      toast.error("Please select a status")
      return
    }

    setUpdatingStatus(id)
    try {
      const endpoint = type === "order" ? `/api/admin/orders/${id}` : `/api/admin/inquiries/${id}`
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusForm.status,
          adminNotes: statusForm.adminNotes || null,
        }),
      })

      const json = await res.json()
      if (res.ok) {
        await loadData()
        setSelectedItem(null)
        setStatusForm({ status: "", adminNotes: "" })
        toast.success("Status updated successfully!")
      } else {
        toast.error(`Error: ${json.error}`)
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      contacted: "bg-purple-500/20 text-purple-400",
      confirmed: "bg-green-500/20 text-green-400",
      processing: "bg-indigo-500/20 text-indigo-400",
      shipped: "bg-cyan-500/20 text-cyan-400",
      delivered: "bg-green-500/20 text-green-400",
      resolved: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
      archived: "bg-gray-500/20 text-gray-400",
    }
    return colors[status] || "bg-gray-500/20 text-gray-400"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Orders & Inquiries</h1>
            <p className="text-skirting-silver/70">View and manage customer orders and contact form submissions</p>
          </div>
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-white/10 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors"
          >
            Manage Products
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "orders"
                ? "text-skirting-amber border-b-2 border-skirting-amber"
                : "text-skirting-silver/60 hover:text-white"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "inquiries"
                ? "text-skirting-amber border-b-2 border-skirting-amber"
                : "text-skirting-silver/60 hover:text-white"
            }`}
          >
            Contact Inquiries ({inquiries.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-skirting-silver">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-skirting-silver/70">No orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-skirting-charcoal border border-white/10 rounded-xl p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{order.order_number}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-skirting-silver/70 text-sm mb-1">
                        <strong>Customer:</strong> {order.customer_name}
                      </p>
                      <p className="text-skirting-silver/70 text-sm mb-1">
                        <strong>Email:</strong> {order.customer_email}
                      </p>
                      <p className="text-skirting-silver/70 text-sm mb-1">
                        <strong>Phone:</strong> {order.customer_phone}
                      </p>
                      {order.customer_address && (
                        <p className="text-skirting-silver/70 text-sm mb-1">
                          <strong>Address:</strong> {order.customer_address}
                          {order.customer_city && `, ${order.customer_city}`}
                          {order.customer_postal_code && ` ${order.customer_postal_code}`}
                        </p>
                      )}
                      <p className="text-skirting-amber font-bold text-lg mt-2">
                        Total: ${order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-skirting-silver/60 text-xs mt-2">
                        Created: {formatDate(order.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(order)
                        setStatusForm({
                          status: order.status,
                          adminNotes: order.admin_notes || "",
                        })
                      }}
                      className="px-4 py-2 bg-skirting-amber/20 text-skirting-amber hover:bg-skirting-amber/30 transition-colors text-sm font-medium rounded"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Order Items */}
                  {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm text-skirting-silver/70">
                            <span>
                              {item.productName} - {item.length}m × {item.quantity} @ ${item.price}/m
                            </span>
                            <span className="text-skirting-amber">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-skirting-silver">Loading inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-skirting-silver/70">No inquiries yet.</p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-skirting-charcoal border border-white/10 rounded-xl p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{inquiry.full_name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-skirting-amber/20 text-skirting-amber">
                          {inquiry.service}
                        </span>
                      </div>
                      <p className="text-skirting-silver/70 text-sm mb-1">
                        <strong>Email:</strong> {inquiry.email}
                      </p>
                      <p className="text-skirting-silver/70 text-sm mb-1">
                        <strong>Phone:</strong> {inquiry.phone}
                      </p>
                      {inquiry.message && (
                        <p className="text-skirting-silver/70 text-sm mt-2">
                          <strong>Message:</strong> {inquiry.message}
                        </p>
                      )}
                      <p className="text-skirting-silver/60 text-xs mt-2">
                        Submitted: {formatDate(inquiry.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(inquiry)
                        setStatusForm({
                          status: inquiry.status,
                          adminNotes: inquiry.admin_notes || "",
                        })
                      }}
                      className="px-4 py-2 bg-skirting-amber/20 text-skirting-amber hover:bg-skirting-amber/30 transition-colors text-sm font-medium rounded"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Status Update Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedItem(null)
                setStatusForm({ status: "", adminNotes: "" })
              }
            }}
            onWheel={(e) => {
              e.stopPropagation()
            }}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault()
              }
            }}
          >
            <div className="bg-skirting-charcoal border border-white/10 rounded-lg sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-2 sm:mx-0">
              {/* Header */}
              <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-lg sm:rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {activeTab === "orders" ? "Order Details" : "Inquiry Details"}
                </h2>
                <button
                  onClick={() => {
                    setSelectedItem(null)
                    setStatusForm({ status: "", adminNotes: "" })
                  }}
                  className="text-skirting-silver hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-lg touch-target"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-4 sm:p-6">

                  {/* Order Details */}
                  {activeTab === "orders" && selectedItem && "order_number" in selectedItem && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Order Information</h3>
                        <div className="bg-skirting-dark rounded-lg p-4 space-y-2 text-sm">
                          <p><strong className="text-skirting-silver">Order #:</strong> <span className="text-white">{(selectedItem as Order).order_number}</span></p>
                          <p><strong className="text-skirting-silver">Customer:</strong> <span className="text-white">{(selectedItem as Order).customer_name}</span></p>
                          <p><strong className="text-skirting-silver">Email:</strong> <span className="text-white">{(selectedItem as Order).customer_email}</span></p>
                          <p><strong className="text-skirting-silver">Phone:</strong> <span className="text-white">{(selectedItem as Order).customer_phone}</span></p>
                          <p><strong className="text-skirting-silver">Address:</strong> <span className="text-white">
                            {(selectedItem as Order).customer_address || "N/A"}
                            {(selectedItem as Order).customer_city && `, ${(selectedItem as Order).customer_city}`}
                            {(selectedItem as Order).customer_postal_code && ` ${(selectedItem as Order).customer_postal_code}`}
                          </span></p>
                          <p><strong className="text-skirting-silver">Total:</strong> <span className="text-skirting-amber font-bold">${(selectedItem as Order).total_amount.toFixed(2)}</span></p>
                          {(selectedItem as Order).customer_notes && (
                            <p><strong className="text-skirting-silver">Customer Notes:</strong> <span className="text-white">{(selectedItem as Order).customer_notes}</span></p>
                          )}
                        </div>
                      </div>
                      {(selectedItem as Order).items && Array.isArray((selectedItem as Order).items) && (selectedItem as Order).items.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Order Items</h3>
                          <div className="bg-skirting-dark rounded-lg p-4 space-y-2">
                            {(selectedItem as Order).items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm border-b border-white/10 pb-2 last:border-0">
                                <span className="text-skirting-silver">
                                  {item.productName} - {item.length}m × {item.quantity} @ ${item.price}/m
                                </span>
                                <span className="text-skirting-amber font-semibold">${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inquiry Details */}
                  {activeTab === "inquiries" && selectedItem && "full_name" in selectedItem && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Inquiry Information</h3>
                        <div className="bg-skirting-dark rounded-lg p-4 space-y-2 text-sm">
                          <p><strong className="text-skirting-silver">Name:</strong> <span className="text-white">{(selectedItem as Inquiry).full_name}</span></p>
                          <p><strong className="text-skirting-silver">Email:</strong> <span className="text-white">{(selectedItem as Inquiry).email}</span></p>
                          <p><strong className="text-skirting-silver">Phone:</strong> <span className="text-white">{(selectedItem as Inquiry).phone}</span></p>
                          <p><strong className="text-skirting-silver">Service:</strong> <span className="text-white">{(selectedItem as Inquiry).service}</span></p>
                          {(selectedItem as Inquiry).message && (
                            <p><strong className="text-skirting-silver">Message:</strong> <span className="text-white">{(selectedItem as Inquiry).message}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Update Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Update Status</h3>
                    <div>
                      <label className="block text-skirting-silver text-sm mb-2">Status *</label>
                      <select
                        value={statusForm.status}
                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                        className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none"
                      >
                        {activeTab === "orders" ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </>
                        ) : (
                          <>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-skirting-silver text-sm mb-2">Admin Notes</label>
                      <textarea
                        value={statusForm.adminNotes}
                        onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                        rows={4}
                        className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none resize-none"
                        placeholder="Add internal notes about this order/inquiry..." />
                    </div>
                  </div>
                </div>

              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 border-t border-white/10 bg-skirting-charcoal px-4 sm:px-6 py-4 rounded-b-lg sm:rounded-b-2xl">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setSelectedItem(null)
                      setStatusForm({ status: "", adminNotes: "" })
                    }}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 border border-white/10 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors rounded-lg text-sm sm:text-base touch-target"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateStatus(selectedItem.id, activeTab === "orders" ? "order" : "inquiry")}
                    disabled={updatingStatus === selectedItem.id}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-target"
                  >
                    {updatingStatus === selectedItem.id ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function OrdersPage() {
  return (
    <AdminAuth>
      <OrdersPageContent />
    </AdminAuth>
  )
}
