# CreatorsMarketCap (CMC)

CreatorsMarketCap is a Next.js 15 (App Router) app for discovering and trading creator coins on Base using the Zora Protocol. It features real-time charts, recent activity, search, smart profile routing, a swap widget, and skeleton loaders. Charts and recent activity now use DexScreener for more reliable, up-to-date data (with Zora fallback).

## 🚀 Tech Stack
- Next.js 15 (Turbopack) + TypeScript
- Tailwind CSS
- Chart.js via react-chartjs-2
- wagmi + viem (wallet + chain)
- Zora Coins SDK (trading / data)
- DexScreener (charts + recent activity)
- CoinGecko (ETH price)

## ✨ Key Features
- Search by name, address, and `@creator` with direct contract navigation
- Coin detail page: price chart, recent activity, holders, swap widget
- Cursor-based pagination across lists
- Smart `/profile` routing: connected wallet → profile, else connect prompt
- Hydration-safe charts, timezone-aware labels, comprehensive skeletons
- DexScreener-backed charts/activity with Zora fallback and no-cache headers

## ⚙️ Setup

Install:
```bash
npm i
```

Env vars (`.env.local` in `cmc/`):
```bash
# Required in production deployments
NEXTAUTH_URL=https://your-vercel-domain.vercel.app

# Optional public keys
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
# NEXT_PUBLIC_ALCHEMY_KEY=...
```

Run:
```bash
npm run dev
```

Build/Start:
```bash
npm run build
npm run start
```

## 📡 Internal API (selected)
- `GET /api/coins` – list coins (sorting, search, cursor pagination)
- `GET /api/coins/[address]` – coin details (+holders, swaps with `includeDetails=true`)
- `GET /api/coins/trending` – trending coins
- `GET /api/profile/[address]` – Zora profile + created coins

### DexScreener-backed endpoints
- `GET /api/coins/[address]/dexscreener-chart?timeframe=24h|7d|30d|1y` – normalized price history plus metadata
- `GET /api/coins/[address]/dexscreener-activity` – normalized recent trades

Both return `Cache-Control: no-store` for freshness. The chart endpoint adds a live "now" point.

## 📝 Notes
- Charts render client-side only to avoid hydration mismatches
- Numbers formatted (K, M, B, T, P, Q) in activity
- ESLint rules relaxed for CI (see `.eslintrc.json`)

## 🗺 Roadmap
- Replace mock WebSocket with real provider for live trades/price
- Candlestick/volume overlays, alerts, portfolio tracking
- Mobile polish and light/dark toggle

## 📄 License
MIT
