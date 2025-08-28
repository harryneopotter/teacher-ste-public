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
# Start development server with Turbopack (DO NOT run directly - see rules)
# Use alternative method to run: 
# - Via PowerShell: powershell -c "bun run dev"
# - Or delegate to another AI assistant
bun run dev
```

### Build & Production
```bash
# Build for production with Turbopack
bun run build

# Start production server
bun run start
```

### Code Quality
```bash
# Run ESLint
bun run lint

# Install dependencies
bun install
```

## Project Structure

```
app/
├── page.tsx           # Main landing page component
├── layout.tsx         # Root layout with metadata
├── globals.css        # Global styles + custom animations
└── favicon.ico

components/ui/         # shadcn/ui components (30+ components)
├── button.tsx
├── card.tsx
├── input.tsx
└── ... (form, navigation, etc.)

lib/
└── utils.ts          # Tailwind class merging utility

hooks/
└── use-mobile.ts     # Mobile breakpoint detection hook
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
- Uses React `useState` for form state
- Radio groups for program selection (Creative Writing, Spoken English, Japanese)
- Client-side form validation and submission handling

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

- **Path Aliases**: Uses `@/` prefix for imports (defined in both `tsconfig.json` and `components.json`)
- **Component Library**: shadcn/ui is pre-configured with Radix UI primitives
- **Form Handling**: Currently logs to console - needs backend integration for actual submissions
- **Content Management**: All text content is hardcoded in the React component
- **Responsive**: Mobile-first design with breakpoint-specific layouts

## Educational Context

This is specifically a **children's creative writing education** website featuring:
- Student work showcases (poems, stories, scripts)
- Small batch teaching approach
- Online group classes for grades 4-7
- Multiple program offerings beyond just creative writing

The design emphasizes creativity, playfulness, and child-friendly aesthetics while maintaining professionalism for parent audiences.
