# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

풍천리를 지켜주세요 (Save Pungcheonri) — a Next.js advocacy website opposing a pumped-storage hydroelectric power plant in rural South Korea. Korean-first with a manual English route at `/en`.

## Commands

```bash
cd website
npm run dev      # Dev server on :3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

All commands must be run from the `website/` directory.

## Architecture

**Framework**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4

**Path alias**: `@/*` maps to `website/src/*`

### Key directories

- `src/app/` — Pages using App Router file-based routing. Each route folder has a `page.tsx`.
- `src/components/` — Shared components (`SubHero`, `Navigation`, `Footer`, `CardNews`, `ShareButtons`, `Analytics`)
- `src/lib/` — Supabase clients, GA4 tracking, and server data access (`supabase.ts`, `supabase-server.ts`, `analytics.ts`, `data/*`)
- `src/data/` — Static data arrays with TypeScript interfaces (`news.ts`, `timeline.ts`)
- `public/images/` — Static images

### Data patterns

- **Static content**: `src/data/*` is used as development fallback seed content for news/timeline.
- **Backend**: Supabase-backed API/data access. `POST /api/signatures` enforces consent + duplicate/rate-limit protections.
- **Fail behavior**: In production, missing/broken Supabase access fails closed (no demo fallback responses).
- **State**: Local `useState` hooks only — no global state library.

### Styling conventions

- Tailwind CSS v4 with custom CSS variables in `globals.css`:
  - `--color-forest` (#2D5016), `--color-warm` (#C75000), `--color-sky` (#1B4965), `--color-earth` (#8B6914)
- Typography: `Pretendard` / `Noto Sans KR` for body, `Nanum Myeongjo` (serif) for headings
- Mobile-first responsive with standard Tailwind breakpoints

### Animation

Framer Motion is used throughout for scroll-triggered animations (`useInView`), number counters, fade-ins with stagger, and page transitions.

### Analytics

GA4 with custom funnel events defined in `src/lib/analytics.ts`: pageView → scrollDepth → signatureStart → signatureComplete → shareClick → cardNewsDownload.

### SEO

Server-side metadata via Next.js Metadata API on each page. Open Graph images, robots.txt, and `sitemap.ts` are configured.

### Image config

`next.config.ts` allows remote images only from hostnames listed in `src/lib/allowed-image-hosts.json` (currently `ojsfile.ohmynews.com`, `www.pressian.com`, `img1.newsis.com`). Use Next.js `<Image>` component for all images.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_SITE_URL
```

See `.env.example`.

## Git Conventions

- Commit messages in Korean
- Pattern: "변경 요약 + 영향 범위" (e.g., "SubHero 컴포넌트 추출 + 서브페이지 히어로 리팩토링")

## Deployment

Hosted on Vercel. Push to `main` triggers auto-deploy.
