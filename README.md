# MORAVEC04 Website

A modern, immersive website showcasing the MORAVEC04 humanoid robot and its PARADOX spatial reasoning model. Built with Next.js 16, GSAP animations, and Lenis smooth scrolling.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd moravec-04-website
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Development Configuration

### ⚠️ Important: TypeScript Build Errors

When working in your local IDE, you **MUST** configure build error handling:

**Required Configuration in `next.config.mjs`:**
\`\`\`javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Keep false for production
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};
\`\`\`

**For Local Development Only:**
If you encounter TypeScript errors that block your development workflow:
1. Temporarily set `ignoreBuildErrors: true` in `next.config.mjs`
2. Fix the TypeScript issues incrementally
3. Set it back to `false` before committing
4. **NEVER** deploy with `ignoreBuildErrors: true`

**VS Code Settings** (Optional)
Add to `.vscode/settings.json`:
\`\`\`json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
\`\`\`

### Environment Setup

No environment variables are required for this template. All assets are included in the repository.

## 📁 Project Structure

\`\`\`
├── app/
│   ├── page.tsx           # Main page with all sections
│   ├── layout.tsx         # Root layout with metadata
│   └── globals.css        # Global styles, Tailwind config
├── components/
│   ├── ui/                # shadcn/ui components
│   └── smooth-scroll.tsx  # Lenis smooth scroll wrapper
├── public/
│   └── images/            # Static assets (logo, backgrounds)
└── package.json
\`\`\`

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Animations**: GSAP with ScrollTrigger
- **Smooth Scroll**: Lenis
- **Typography**: Inter (Google Fonts)
- **Language**: TypeScript

## ✨ Key Features

### Scroll-Based Section Transitions
The site uses GSAP ScrollTrigger to create immersive transitions:
- Hero section scales down and slides up
- Subsequent sections "pull up" from below
- Each section is pinned during its animation

### Blend Mode Typography
The hero heading uses `mix-blend-difference` to invert colors based on the background video content.

### Custom Animations
- Background image scaling loop (30s)
- Hamburger to X icon transformation
- Full-page menu with ripple effect
- Accordion FAQs with smooth open/close

## 🎯 Development Tips

### Adding New Sections
1. Add a new ref: `const newSectionRef = useRef<HTMLDivElement>(null)`
2. Position it absolutely with `top-full` and appropriate z-index
3. Add to GSAP timeline in the ScrollTrigger animation
4. Increment the `end` value: `+=150%` for each new transition

### Modifying Animations
All scroll animations are in `app/page.tsx` within the `useEffect` that sets up GSAP ScrollTrigger. Adjust:
- Scale values for depth effect
- Duration with `end: "+=XXX%"`
- Easing with `ease: "power2.inOut"`

### Customizing Colors
Update the emerald accent color throughout:
- Menu overlay: `bg-emerald-500`
- Scrollbar: `bg-emerald-500`
- Buttons: `hover:bg-emerald-500`
- Text selection: `::selection` in `globals.css`

## 🐛 Troubleshooting

### Video Not Loading
Ensure `public/bg-video.mp4` exists and is encoded in H.264 for broad browser support.

### Scroll Animation Not Working
Check that:
1. Lenis is initialized in `components/smooth-scroll.tsx`
2. ScrollTrigger.refresh() is being called after Lenis updates
3. All section refs are properly assigned

### Build Errors
Run `npm run build` to catch TypeScript/ESLint errors before deployment.

## 📝 License

This is a template project for demonstration purposes.

## 🤝 Contributing

Feel free to fork and customize for your own projects!
# skirting
