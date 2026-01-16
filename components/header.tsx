"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/products", label: "Products" },
    { href: "/installation", label: "Installation" },
    { href: "/contact", label: "Contact" },
    { href: "/news", label: "News" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-skirting-dark/95 backdrop-blur-md border-b border-skirting-silver/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity shrink-0">
            <Image
              src="/images/logo.png"
              alt="Innovation Skirting Logo"
              width={240}
              height={67}
              className="h-16 sm:h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-light uppercase tracking-wide text-skirting-silver hover:text-skirting-amber transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/products"
              className="text-sm font-medium uppercase tracking-wide text-skirting-dark bg-skirting-amber px-5 py-2.5 hover:bg-white transition-colors"
            >
              Shop Now
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/products"
              className="text-xs font-medium uppercase tracking-wide text-skirting-dark bg-skirting-amber px-3 py-1.5 hover:bg-white transition-colors"
            >
              Shop
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-skirting-silver hover:text-skirting-amber transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-skirting-silver/10 animate-in slide-in-from-top duration-200">
            <nav className="py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-light uppercase tracking-wide text-skirting-silver hover:text-skirting-amber hover:bg-white/5 transition-colors rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium uppercase tracking-wide text-skirting-dark bg-skirting-amber hover:bg-white transition-colors rounded-lg text-center mt-4"
              >
                Shop Now
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
