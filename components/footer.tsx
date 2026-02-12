import Link from "next/link"
import Image from "next/image"

export function Footer() {
  const footerLinks = [
    { href: "/products", label: "Products" },
    { href: "/features", label: "Features" },
    { href: "/installation", label: "Installation" },
    { href: "/contact", label: "Contact" },
    { href: "/news", label: "News" },
  ]

  return (
    <footer className="border-t border-skirting-silver/10 bg-skirting-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
          <Image
              src="/images/logo.png"
              alt="Innovation Skirting Logo"
              width={240}
              height={67}
              className="h-16 sm:h-20 w-auto"
            />
            <p className="text-skirting-silver/40 text-xs sm:text-sm text-center sm:text-left">
              © 2024 Innovation Skirting. Premium LED and aluminium skirting boards in New Zealand. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-skirting-silver/50 hover:text-skirting-amber text-xs sm:text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
