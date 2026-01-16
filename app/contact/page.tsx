"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (res.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.")
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        })
      } else {
        toast.error(json.error || "Failed to send message")
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-skirting-charcoal to-skirting-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-skirting-amber text-xs sm:text-sm font-bold uppercase tracking-widest">Get in Touch</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-skirting-silver mt-4 sm:mt-6 tracking-tight">
            Request a Quote
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-skirting-silver/70 mt-4 sm:mt-6 max-w-3xl mx-auto">
            Contact Innovation Skirting for expert advice, quotes, and installation services. New Zealand's skirting specialists.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 sm:py-16 lg:py-20 bg-skirting-charcoal px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-skirting-silver mb-6 sm:mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-skirting-dark border border-skirting-silver/20 text-skirting-silver placeholder:text-skirting-silver/40 focus:border-skirting-amber focus:outline-none text-sm sm:text-base rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-skirting-dark border border-skirting-silver/20 text-skirting-silver placeholder:text-skirting-silver/40 focus:border-skirting-amber focus:outline-none text-sm sm:text-base rounded-lg"
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-skirting-dark border border-skirting-silver/20 text-skirting-silver placeholder:text-skirting-silver/40 focus:border-skirting-amber focus:outline-none text-sm sm:text-base rounded-lg"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-skirting-dark border border-skirting-silver/20 text-skirting-silver placeholder:text-skirting-silver/40 focus:border-skirting-amber focus:outline-none text-sm sm:text-base rounded-lg"
                />
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 bg-skirting-dark border border-skirting-silver/20 text-skirting-silver focus:border-skirting-amber focus:outline-none text-sm sm:text-base rounded-lg"
                >
                  <option value="">Select Service</option>
                  <option value="quote">Product Quote</option>
                  <option value="installation">Professional Installation</option>
                  <option value="consultation">Design Consultation</option>
                  <option value="other">Other Inquiry</option>
                </select>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-skirting-dark border border-skirting-silver/20 text-skirting-silver placeholder:text-skirting-silver/40 focus:border-skirting-amber focus:outline-none resize-none text-sm sm:text-base rounded-lg"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 sm:py-4 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors text-sm sm:text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-skirting-silver mb-6 sm:mb-8">Contact Information</h2>
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-skirting-dark border border-skirting-silver/10 rounded-xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-skirting-amber mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-skirting-silver font-medium text-sm sm:text-base mb-1">Address</p>
                      <p className="text-skirting-silver/60 text-sm sm:text-base">
                        Auckland, New Zealand
                        <br />
                        Serving all of New Zealand
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-skirting-dark border border-skirting-silver/10 rounded-xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-skirting-amber mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                    <div>
                      <p className="text-skirting-silver font-medium text-sm sm:text-base mb-1">Phone</p>
                      <a
                        href="tel:+6491234567"
                        className="text-skirting-silver/60 hover:text-skirting-amber text-sm sm:text-base transition-colors"
                      >
                        +64 9 123 4567
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-skirting-dark border border-skirting-silver/10 rounded-xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-skirting-amber mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    <div>
                      <p className="text-skirting-silver font-medium text-sm sm:text-base mb-1">Email</p>
                      <a
                        href="mailto:info@innovationskirting.co.nz"
                        className="text-skirting-silver/60 hover:text-skirting-amber text-sm sm:text-base transition-colors"
                      >
                        info@innovationskirting.co.nz
                      </a>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-skirting-dark border border-skirting-silver/10 rounded-xl p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-skirting-silver mb-4">Business Hours</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-skirting-silver/60">Monday - Friday</span>
                      <span className="text-skirting-silver">08:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-skirting-silver/60">Saturday</span>
                      <span className="text-skirting-silver">09:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-skirting-silver/60">Sunday</span>
                      <span className="text-skirting-silver">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
