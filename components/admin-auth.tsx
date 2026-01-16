"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface AdminAuthProps {
  children: React.ReactNode
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify")
        if (res.ok) {
          setIsAuthenticated(true)
        }
      } catch (err) {
        // Not authenticated
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pin.trim()) {
      toast.error("Please enter a PIN")
      return
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })

      const json = await res.json()

      if (res.ok && json.success) {
        setIsAuthenticated(true)
        toast.success("Access granted")
        setPin("")
      } else {
        toast.error(json.error || "Invalid PIN")
        setPin("")
      }
    } catch (err) {
      toast.error("Error verifying PIN")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-skirting-dark flex items-center justify-center">
        <div className="text-skirting-silver">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-skirting-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-skirting-charcoal border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-skirting-silver/70">Enter PIN to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-skirting-silver text-sm mb-2">PIN Code</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-skirting-amber focus:outline-none text-center text-2xl tracking-widest"
                placeholder="••••"
                autoFocus
                maxLength={10}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors rounded-lg"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
