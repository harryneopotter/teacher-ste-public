# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Tanya English Teacher** marketing website - a Next.js 15 application showcasing Tanya Kaushik's Creative Writing Program for children grades 4-7. It's a single-page marketing site with a focus on creative writing education and student enrollment.

## Tech Stack & Architecture

- **Framework**: Next.js 15 with App Router (React 19)
- **Styling**: TailwindCSS 4 with shadcn/ui component library
- **Build Tool**: Turbopack (Next.js's new bundler)
- **Package Manager**: Bun (as evidenced by bun.lock)
- **TypeScript**: Strict mode enabled
- **Components**: Radix UI primitives with custom styling

### Key Architecture Patterns

- **Single Page Application**: Everything is in `app/page.tsx` - a marketing landing page
- **Component-based**: Uses shadcn/ui components with custom styling
- **Form Handling**: Client-side form state management with React hooks
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Animation-focused**: Custom CSS animations and hover effects for engaging UX

## Essential Commands

### Development
```bash
# Start development server with Turbopack
# ⚠️ IMPORTANT: Never run dev commands directly in terminal (per user rules)
# Use PowerShell wrapper or delegate to another AI:
bun run dev  # Runs on http://localhost:3000

# Alternative execution methods:
# Via PowerShell: powershell -c "bun run dev"
# Via another AI assistant to avoid terminal hijacking
```

### Build & Production
```bash
# Build for production with Turbopack (Next.js 15)
bun run build

# Start production server
bun run start

# Type checking (TypeScript strict mode)
bun run build  # Includes type checking
```

### Code Quality & Linting
```bash
# Run ESLint with Next.js and TypeScript rules
bun run lint

# Install/update dependencies
bun install

# Check for outdated packages
bun outdated
```

### Testing & Development
```bash
# No test setup currently - would need to add:
# bun add -d jest @testing-library/react @testing-library/jest-dom
# bun add -d @types/jest jest-environment-jsdom
```

## Project Structure

```
app/
├── page.tsx           # Main landing page - single component architecture
├── layout.tsx         # Root layout with ThemeProvider + metadata
├── globals.css        # Global styles + Tailwind 4 config + animations
└── favicon.ico

components/
├── theme-toggle.tsx       # Dark/light mode toggle with next-themes
└── ui/                    # shadcn/ui component library (30+ components)
    ├── button.tsx         # Radix UI Button primitive
    ├── card.tsx           # Layout component for content sections
    ├── input.tsx          # Form input with styling
    ├── dialog.tsx         # Modal dialogs for PDF showcase
    ├── radio-group.tsx    # Form program selection
    └── ... (accordion, alert, avatar, etc.)

lib/
└── utils.ts              # cn() function for Tailwind class merging

hooks/
└── use-mobile.ts         # Mobile breakpoint detection hook

docs/                     # Student work PDF files (duplicated in public/)
├── Fifilldi.pdf
├── Navedh poem portfolio.pdf
└── Varenyam poem portfolio.pdf

public/                   # Static assets
├── pdfs/                  # PDF files served from here (/pdfs/ route)
│   ├── Fifilldi.pdf
│   ├── Navedh poem portfolio.pdf
│   └── Varenyam poem portfolio.pdf
├── favicon.svg
└── *.svg (Next.js default icons)
```

## Component Architecture

### Main Page Structure (`app/page.tsx`)
The entire site is a single React component with these sections:
1. **Hero Section** - Asymmetric layout with floating elements
2. **About Section** - Teacher introduction with curved design
3. **Vision Section** - Three-card layout with diagonal background
4. **Program Details** - Zigzag alternating layout
5. **Application Form** - Student enrollment form with React state
6. **Student Showcase** - Masonry grid of student work examples
7. **Footer** - Contact information with wave design

### Form Management
- Uses React `useState` for form state (no external form libraries)
- Radio groups for program selection (Creative Writing, Spoken English, Japanese)
- Client-side form validation and submission handling
- Form submission currently logs to console - requires backend integration
- Form fields: name, grade, phone, program, comments

### Design System
- **Color Palette**: Purple/Pink gradient theme with pastel accents
- **Components**: shadcn/ui with "new-york" style variant
- **Icons**: Lucide React icons throughout
- **Animations**: Custom CSS animations (float, fade-in-up, pulse-soft)
- **Layout**: Creative asymmetric designs with rotated cards and curved sections

## Custom Styling & Theming

The project uses Tailwind 4's new inline theme configuration in `globals.css`:
- Custom CSS variables for consistent color system
- Dark mode support (though not actively used)
- Custom animation keyframes for enhanced UX
- Pastel gradient classes and hover effects

## Development Notes

### Configuration
- **Path Aliases**: Uses `@/` prefix for imports (configured in `tsconfig.json`)
- **TypeScript**: Strict mode enabled with Next.js 15 support
- **ESLint**: Next.js + TypeScript rules configured in `eslint.config.mjs`
- **Component Library**: shadcn/ui pre-configured with "new-york" variant

### Current Limitations
- **Form Backend**: Form submissions only log to console - needs backend integration
- **Content Management**: All content hardcoded in React components
- **Testing**: No test suite configured (Jest/Testing Library recommended)
- **Error Boundaries**: No React error boundaries for PDF loading failures
- **Analytics**: No tracking/analytics setup

### Technical Considerations
- **PDF Viewing**: Uses native browser PDF rendering via iframe elements
- **Performance**: Uses React 19 with Next.js 15 Turbopack for fast builds
- **Mobile First**: Responsive design with Tailwind breakpoints
- **Accessibility**: Dialog components include proper ARIA labels and titles
- **Theme Support**: Complete dark/light mode with next-themes

## Debugging & Common Issues

### PDF Viewer Issues
- **Browser Compatibility**: Uses iframe for PDF rendering - works in all modern browsers
- **File Paths**: PDF files served from `/pdfs/` route (Next.js public folder mapping)
- **Loading**: PDFs load directly in browser's native PDF viewer within modal dialogs
- **Accessibility**: iframes include proper title attributes for screen readers

### Theme Issues
- **Hydration**: ThemeToggle has mounted state to prevent SSR/client mismatch
- **Dark Mode**: All components have proper dark mode variants with transition animations

### Development Server
- **Port**: Defaults to localhost:3000, may auto-increment if occupied
- **Hot Reload**: Turbopack enables fast refresh for all components
- **Terminal Commands**: Per user rules, never run `bun run dev` directly - use PowerShell wrapper

## Educational Context

This is specifically a **children's creative writing education** website featuring:
- Student work showcases with simple PDF modal viewer
- Small batch teaching approach (personalized attention)
- Online group classes for grades 4-7 (ages 9-12)
- Multiple program offerings: Creative Writing, Spoken English, Japanese
- Parent-focused marketing with child-friendly design aesthetics

### Business Requirements
- Lead generation through application form
- Student work showcase with native PDF viewing in modals
- Professional teacher branding (Tanya Kaushik)
- Mobile-responsive for parent accessibility
- Simple, reliable PDF viewing without complex dependencies
