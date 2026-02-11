import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getNewsArticles, getFeaturedArticles } from "@/lib/news"

export const metadata: Metadata = {
  title: "Skirting News NZ | Articles & Tips on Skirting Boards",
  description:
    "Latest skirting news and articles for New Zealand. Tips on LED skirting, skirting installation, and modern skirting trends. From NZ's #1 skirting specialist.",
  keywords: [
    "skirting news NZ",
    "skirting articles",
    "skirting tips",
    "LED skirting guide",
    "skirting boards NZ",
    "skirting trends",
    "skirting installation tips",
    "modern skirting ideas",
    "skirting blog NZ",
  ],
  openGraph: {
    title: "Skirting News & Articles | Innovation Skirting NZ",
    description: "Latest news, tips, and articles on skirting boards in New Zealand.",
    type: "website",
    locale: "en_NZ",
  },
  alternates: {
    canonical: "https://skirting.co.nz/news",
  },
}

export default function NewsPage() {
  const articles = getNewsArticles()
  const featured = getFeaturedArticles()

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            News & Insights
          </h1>
          <p className="text-lg text-skirting-silver/70 max-w-2xl mx-auto">
            Stay updated with the latest news about skirting boards in New Zealand. Learn why Innovation Skirting is
            New Zealand's #1 skirting specialist.
          </p>
        </div>

        {/* Featured Articles */}
        {featured.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group bg-skirting-charcoal border border-white/10 rounded-2xl overflow-hidden hover:border-skirting-amber/50 transition-all duration-300"
                >
                  <div className="aspect-video relative bg-skirting-dark">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-skirting-amber/20 to-skirting-charcoal">
                        <div className="text-6xl text-skirting-amber/30">📰</div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-skirting-amber text-skirting-dark px-3 py-1 text-xs uppercase tracking-wider font-medium rounded">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-skirting-silver/60 mb-2">
                      {new Date(article.publishedAt).toLocaleDateString("en-NZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-skirting-amber transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-skirting-silver/70 text-sm leading-relaxed">{article.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2 text-skirting-amber text-sm font-medium">
                      Read More
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">All Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group bg-skirting-charcoal border border-white/10 rounded-xl overflow-hidden hover:border-skirting-amber/50 transition-all duration-300"
              >
                <div className="aspect-video relative bg-skirting-dark">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-skirting-amber/10 to-skirting-charcoal">
                      <div className="text-4xl text-skirting-amber/20">📄</div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs text-skirting-silver/60 mb-2">
                    {new Date(article.publishedAt).toLocaleDateString("en-NZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-skirting-amber transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-skirting-silver/70 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
