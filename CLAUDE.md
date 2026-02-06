# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (Next.js + Turbopack)
bun run build    # Production build
bun run lint     # ESLint (uses Next.js defaults, no .eslintrc)
bun add <pkg> --no-cache  # Install packages (use --no-cache for large deps like Privy)
```

No test framework is configured.

## Architecture

Ghost Finance is a cross-chain token swap UI built with Next.js 16 (App Router), React 19, and Tailwind CSS 4.

### Key Patterns

- **All page/component code is client-side** (`"use client"`) — Privy hooks, wallet state, and animations require it. Only `layout.tsx` is a server component.
- **Providers pattern**: `app/providers.tsx` wraps the app with `PrivyProvider` (wallet auth). New context providers go here.
- **Navbar**: `components/Navbar.tsx` — shared client component in `layout.tsx`. Nav links: Swap (`/`), Explore (`/explore`), Stake (`/stake`), Portfolio (`/portfolio`). Uses `usePathname()` for active state, Privy for wallet connect/disconnect.
- **Privy v3 API**: Use `usePrivy()` for auth state/login/logout, `useWallets()` for connected wallets. Embedded wallet config uses `embeddedWallets.ethereum.createOnLogin` (NOT the legacy top-level `embeddedWallets.createOnLogin`).
- **Token/Network data**: `lib/tokens.ts` — token and network lists with mock prices and network availability. Helpers: `getTokenById()`, `getNetworkById()`, `getRate()`, `getTokensForNetwork()`. `lib/explore-tokens.ts` extends this with market data (FDV, volume, market cap, TVL, descriptions) for the explore pages.
- **Seeded random for deterministic mock data**: Custom `seededRandom()` (LCG algorithm) + `hashStr()` used across order books, charts, and trade data. Produces consistent output per token pair across rerenders.
- **Dynamic decimal precision**: Price display uses adaptive decimals — price >= 100: 2 decimals, >= 1: 4 decimals, else 6. Applied in order books, charts, and price displays.
- **SVG charts**: Custom inline SVG charts with Catmull-Rom cubic bezier splines for smooth curves. No external chart library in use. Momentum-based random walk for realistic price data.

### Shared Components

- **CryptoIcon** (`components/CryptoIcon.tsx`): SVG icons by token/network ID. Handles network→token icon mapping. Fallback: colored circle with first letter.
- **SelectModal** (`components/SelectModal.tsx`): Generic dark-themed modal with search for selecting tokens or networks.
- **OrderBook** (`components/OrderBook.tsx`): Order book display with seeded mock bids/asks.
- **DotPattern** (`components/ui/dot-pattern.tsx`): Animated background dots using `motion` library. Uses small radius, wide spacing, and low opacity on content-heavy pages to avoid visual interference.

### Styling

- **Tailwind CSS 4** with `@theme inline {}` in `globals.css` — no `tailwind.config.js`.
- Colors are hardcoded hex values in className strings. Use `cn()` from `lib/utils.ts` for conditional class merging.
- **Icons**: Lucide React for standard icons, `CryptoIcon` for token/network icons, inline SVGs for brand icons (X/Twitter, globe, etc.).
- **Fonts**: Geist Sans + Geist Mono via `next/font/google` CSS variables.

### Design Tokens

- Background: `#0b0b0e`, card: `#0d0d10`–`#161619`, panel: `#09090c`–`#111114`
- Accent/CTA yellow: `#e5e044`
- Borders: `#18181c`, `#1e1e24`, `#2a2a2e`
- Green (positive): `#4ade80`, Red (negative): `#f87171`

### Pages

- **`/` (Swap)**: Cross-chain token swap with Swap/Limit tabs. Token/network selectors, amount input with live conversion. Limit tab has price input, amount with % shortcuts, expiry selector.
- **`/explore`**: Token explorer with sortable table (price, 1H/1D change, FDV, volume). Tabs: Tokens, Auctions, Pools, Transactions. Rows link to `/explore/[tokenId]`.
- **`/explore/[tokenId]`**: Token detail page. Two-column layout: left has SVG price chart (smooth Catmull-Rom curves, timeframe selector), stats row, and order book; right has swap widget, about section, and network pills.
- **`/trade`**: Full trading interface (wider `max-w-[1200px]`). SVG price chart + buy/sell order form + `OrderBook` + recent trades.
- **`/stake`**: Staking pools with expandable cards, stake/unstake forms, APY/TVL info.

### lightweight-charts v5 (if adding charts)

Use `chart.addSeries(AreaSeries, options)` — not `chart.addAreaSeries()`. `lineWidth` must be an integer (1, 2, 3, 4), not a float.

## Environment Variables

- `NEXT_PUBLIC_PRIVY_APP_ID` — Privy app ID (in `.env.local`)
