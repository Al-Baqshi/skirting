import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import { getArticleBySlug, getNewsArticles } from "@/lib/news"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = getNewsArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return {
      title: "Article Not Found - Innovation Skirting",
    }
  }

  return {
    title: `${article.seoTitle || article.title} | Innovation Skirting`,
    description: article.seoDescription || article.excerpt,
    keywords: article.metaKeywords || [],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
    },
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-skirting-amber hover:text-white transition-colors text-sm mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </Link>
          <div className="text-sm text-skirting-silver/60 mb-4">
            {new Date(article.publishedAt).toLocaleDateString("en-NZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" • "}
            {article.author}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">{article.title}</h1>
          {article.excerpt && (
            <p className="text-xl text-skirting-silver/70 leading-relaxed">{article.excerpt}</p>
          )}
        </div>

        {/* Article Image */}
        {article.image && (
          <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="object-cover w-full h-full absolute inset-0"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-invert prose-amber max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{
            color: "#d3d6da",
          }}
        />

        {/* CTA Section */}
        <div className="mt-12 p-8 bg-skirting-charcoal border border-skirting-amber/30 rounded-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">Ready to Order Premium Skirting Boards?</h2>
          <p className="text-skirting-silver/70 mb-6">
            As New Zealand's only specialized skirting company, we offer the best prices and highest quality skirting
            boards. Order from Innovation Skirting today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="px-6 py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors text-center"
            >
              View Products
            </Link>
            <Link
              href="/#contact"
              className="px-6 py-3 border-2 border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors text-center"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  )
}
