# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (Next.js + Turbopack)
bun run build    # Production build
bun run lint     # ESLint
bun add <pkg> --no-cache  # Install packages (use --no-cache for large deps like Privy)
```

No test framework is configured.

## Architecture

Ghost Finance is a cross-chain token swap UI built with Next.js 16 (App Router), React 19, and Tailwind CSS 4.

### Key Patterns

- **All page/component code is client-side** (`"use client"`) — Privy hooks, wallet state, and animations require it. Only `layout.tsx` is a server component.
- **Providers pattern**: `app/providers.tsx` wraps the app with `PrivyProvider` (wallet auth). New context providers go here.
- **Privy v3 API**: Use `usePrivy()` for auth state/login/logout, `useWallets()` for connected wallets. Embedded wallet config uses `embeddedWallets.ethereum.createOnLogin` (NOT the legacy top-level `embeddedWallets.createOnLogin`).
- **Styling**: Tailwind CSS 4 with `@theme inline {}` in `globals.css` for design tokens — no `tailwind.config.js`. Colors are mostly hardcoded hex values in className strings. Use `cn()` from `lib/utils.ts` for conditional class merging.
- **Icons**: Lucide React for standard icons, inline SVGs for brand/crypto icons.

### Design Tokens

- Background: `#0b0b0e`, card: `#161619`, panel: `#111114`, surface: `#1a1a1e`
- Accent/CTA yellow: `#e5e044`
- Borders: `#1e1e24`, `#2a2a2e`
- Fonts: Geist Sans (sans), Geist Mono (mono) via CSS variables

### lightweight-charts v5 (if adding charts)

Use `chart.addSeries(AreaSeries, options)` — not `chart.addAreaSeries()`. `lineWidth` must be an integer (1, 2, 3, 4), not a float.

## Environment Variables

- `NEXT_PUBLIC_PRIVY_APP_ID` — Privy app ID (in `.env.local`)
