export interface NewsArticle {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  image?: string
  author: string
  publishedAt: string
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  featured?: boolean
}

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Why Innovation Skirting is New Zealand's Leading Skirting Specialist",
    slug: "why-innovation-skirting-is-new-zealands-leading-skirting-specialist",
    excerpt: "Discover why Innovation Skirting is the only specialized skirting company in New Zealand, offering the best prices and highest quality skirting boards.",
    content: `
      <h2>New Zealand's Premier Skirting Specialist</h2>
      <p>When it comes to skirting boards in New Zealand, Innovation Skirting stands alone as the country's only dedicated skirting specialist. Unlike general construction suppliers, we focus exclusively on skirting boards - and that specialization makes all the difference.</p>
      
      <h3>Why Specialization Matters</h3>
      <p>While other companies offer skirting as an afterthought, skirting boards are our entire business. This means:</p>
      <ul>
        <li><strong>Best Prices:</strong> Direct relationships with manufacturers and bulk purchasing power mean we can offer the most competitive prices in New Zealand</li>
        <li><strong>Highest Quality:</strong> We test every product, work only with premium manufacturers, and ensure every skirting board meets our exacting standards</li>
        <li><strong>Expert Knowledge:</strong> Our team lives and breathes skirting boards - we know every detail, every option, every solution</li>
        <li><strong>Comprehensive Range:</strong> From residential LED skirting to commercial-grade solutions, we have it all</li>
      </ul>
      
      <h3>What Makes Us Different</h3>
      <p>Innovation Skirting is not just another supplier. We are New Zealand's skirting experts, offering:</p>
      <ul>
        <li>Exclusive focus on skirting boards only</li>
        <li>Best prices guaranteed - we'll match or beat any competitor</li>
        <li>Highest quality materials and manufacturing</li>
        <li>Full range of LED skirting solutions</li>
        <li>Expert installation services</li>
        <li>5-year warranty on all products</li>
      </ul>
      
      <h3>Order from New Zealand's Skirting Specialists</h3>
      <p>Ready to transform your space with premium skirting boards? Order from Innovation Skirting today and experience why we're New Zealand's #1 choice for skirting boards.</p>
    `,
    author: "Innovation Skirting Team",
    publishedAt: "2024-01-15",
    seoTitle: "New Zealand's Leading Skirting Specialist - Innovation Skirting",
    seoDescription: "Innovation Skirting is New Zealand's only specialized skirting company. Best prices, highest quality skirting boards. Order now!",
    metaKeywords: ["skirting specialist", "New Zealand skirting", "best skirting prices", "skirting boards NZ"],
    featured: true,
  },
  {
    id: 2,
    title: "The Complete Guide to LED Skirting Boards in New Zealand",
    slug: "complete-guide-led-skirting-boards-new-zealand",
    excerpt: "Everything you need to know about LED skirting boards in New Zealand. From installation to choosing the right product, we cover it all.",
    content: `
      <h2>LED Skirting Boards: The Future of Interior Design</h2>
      <p>LED skirting boards are revolutionizing interior design in New Zealand homes and businesses. Combining functionality with stunning aesthetics, these innovative baseboards provide ambient lighting while maintaining a clean, modern look.</p>
      
      <h3>What Are LED Skirting Boards?</h3>
      <p>LED skirting boards are aluminium baseboards with integrated LED lighting strips. They replace traditional skirting boards while adding ambient lighting to any room. Perfect for New Zealand homes, they provide both practical and aesthetic benefits.</p>
      
      <h3>Benefits of LED Skirting in New Zealand</h3>
      <ul>
        <li><strong>Energy Efficient:</strong> LED technology uses minimal power while providing excellent illumination</li>
        <li><strong>Modern Aesthetics:</strong> Clean lines and integrated lighting create a contemporary look</li>
        <li><strong>Versatile:</strong> Available in warm white, cool white, RGB, and tunable white options</li>
        <li><strong>Smart Features:</strong> Many models include WiFi, app control, and motion sensors</li>
        <li><strong>Easy Installation:</strong> Click-fit systems make installation straightforward</li>
      </ul>
      
      <h3>Choosing the Right LED Skirting for Your New Zealand Home</h3>
      <p>At Innovation Skirting, we offer the widest range of LED skirting boards in New Zealand. From compact 60mm profiles to wide 200mm commercial solutions, we have the perfect skirting board for every application.</p>
      
      <h3>Why Choose Innovation Skirting?</h3>
      <p>As New Zealand's only specialized skirting company, we offer:</p>
      <ul>
        <li>Best prices on all LED skirting boards</li>
        <li>Highest quality products with 5-year warranty</li>
        <li>Expert advice and installation services</li>
        <li>Comprehensive product range</li>
      </ul>
    `,
    author: "Innovation Skirting Team",
    publishedAt: "2024-01-10",
    seoTitle: "LED Skirting Boards Guide - New Zealand's Complete Guide",
    seoDescription: "Complete guide to LED skirting boards in New Zealand. Learn about installation, benefits, and choosing the right product. Best prices from Innovation Skirting.",
    metaKeywords: ["LED skirting boards", "LED baseboard", "New Zealand", "skirting guide", "LED lighting"],
    featured: true,
  },
  {
    id: 3,
    title: "Best Prices on Skirting Boards in New Zealand - Guaranteed",
    slug: "best-prices-skirting-boards-new-zealand-guaranteed",
    excerpt: "Innovation Skirting guarantees the best prices on skirting boards in New Zealand. We'll match or beat any competitor's price.",
    content: `
      <h2>Best Prices Guaranteed</h2>
      <p>At Innovation Skirting, we're committed to offering the best prices on skirting boards in New Zealand. As the country's only specialized skirting company, we have direct relationships with manufacturers and bulk purchasing power that allows us to pass savings directly to our customers.</p>
      
      <h3>Our Price Guarantee</h3>
      <p>We guarantee the best prices on all skirting boards in New Zealand. If you find a lower price elsewhere, we'll match it - and often beat it. Our commitment to competitive pricing is part of what makes us New Zealand's #1 choice for skirting boards.</p>
      
      <h3>Why Our Prices Are the Best</h3>
      <ul>
        <li><strong>Direct Manufacturer Relationships:</strong> We work directly with manufacturers, cutting out middlemen</li>
        <li><strong>Bulk Purchasing:</strong> Our specialization allows us to buy in larger volumes at better rates</li>
        <li><strong>No Hidden Costs:</strong> Transparent pricing with no surprises</li>
        <li><strong>Regular Specials:</strong> Check our website for ongoing promotions and discounts</li>
      </ul>
      
      <h3>Quality Doesn't Mean Expensive</h3>
      <p>Best prices don't mean compromising on quality. Every skirting board we sell meets our strict quality standards and comes with a 5-year warranty. We believe you should get the best quality at the best price.</p>
      
      <h3>Order Today</h3>
      <p>Ready to get the best price on premium skirting boards? Browse our range and order today. New Zealand's skirting specialists are here to help.</p>
    `,
    author: "Innovation Skirting Team",
    publishedAt: "2024-01-05",
    seoTitle: "Best Prices on Skirting Boards New Zealand - Price Guarantee",
    seoDescription: "Best prices on skirting boards in New Zealand guaranteed. Innovation Skirting will match or beat any competitor. Order now!",
    metaKeywords: ["best skirting prices", "cheap skirting boards", "skirting boards NZ", "best prices", "price guarantee"],
    featured: false,
  },
  {
    id: 4,
    title: "Highest Quality Skirting Boards - Innovation Skirting's Quality Promise",
    slug: "highest-quality-skirting-boards-innovation-skirting-quality-promise",
    excerpt: "Innovation Skirting delivers the highest quality skirting boards in New Zealand. Learn about our quality standards and 5-year warranty.",
    content: `
      <h2>Highest Quality Guaranteed</h2>
      <p>At Innovation Skirting, quality isn't negotiable. As New Zealand's only specialized skirting company, we've built our reputation on delivering the highest quality skirting boards available.</p>
      
      <h3>Our Quality Standards</h3>
      <p>Every skirting board we sell undergoes rigorous quality checks:</p>
      <ul>
        <li><strong>Premium Materials:</strong> Only the finest aluminium and LED components</li>
        <li><strong>Manufacturing Excellence:</strong> We work only with certified manufacturers</li>
        <li><strong>Quality Testing:</strong> Every product is tested before shipping</li>
        <li><strong>Durability:</strong> Built to last with 50,000+ hour LED lifespan</li>
      </ul>
      
      <h3>5-Year Warranty</h3>
      <p>All our skirting boards come with a comprehensive 5-year warranty covering materials and workmanship. This is our commitment to quality and your peace of mind.</p>
      
      <h3>Why Quality Matters</h3>
      <p>Skirting boards are a long-term investment. Choosing the highest quality products means:</p>
      <ul>
        <li>Longer lifespan and better value</li>
        <li>Consistent performance over years</li>
        <li>Fewer maintenance issues</li>
        <li>Better aesthetics that last</li>
      </ul>
      
      <h3>Experience the Difference</h3>
      <p>Experience the Innovation Skirting difference - highest quality skirting boards at the best prices. Order from New Zealand's skirting specialists today.</p>
    `,
    author: "Innovation Skirting Team",
    publishedAt: "2024-01-01",
    seoTitle: "Highest Quality Skirting Boards New Zealand - Quality Guarantee",
    seoDescription: "Highest quality skirting boards in New Zealand. Innovation Skirting's quality promise with 5-year warranty. Best quality, best prices.",
    metaKeywords: ["quality skirting boards", "premium skirting", "best quality", "skirting boards NZ", "warranty"],
    featured: false,
  },
]

export const getNewsArticles = (): NewsArticle[] => {
  return newsArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export const getFeaturedArticles = (): NewsArticle[] => {
  return newsArticles.filter((a) => a.featured)
}

export const getArticleBySlug = (slug: string): NewsArticle | undefined => {
  return newsArticles.find((a) => a.slug === slug)
}
