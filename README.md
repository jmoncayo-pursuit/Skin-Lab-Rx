# Skin Lab Rx 🔬

**AI-Powered Skin Analysis & Product Recommender with Virtual Try-On**

Built for the [Perfect Corp × Startup World Cup Hackathon](https://perfectcorphackathon.devpost.com/)

---

## What It Does

Skin Lab Rx is a mobile-first web app that uses Perfect Corp's AI APIs to:

1. **Analyze Your Skin** — Upload a selfie and get AI-scored diagnostics across 14 skin metrics (acne, wrinkles, pores, texture, hydration, oiliness, redness, dark circles, age spots, radiance, firmness, eye bags)
2. **Recommend Products** — Get personalized skincare product matches ranked by your worst-performing concerns
3. **Virtual Try-On** — Upload any reference makeup look and see it transferred onto your face using AI Makeup Transfer

## Perfect Corp APIs Used

- **AI Skin Analysis** (`/s2s/v2.0/task/skin-analysis`) — SD skin concern detection with 14 metrics
- **AI Makeup Transfer** (`/s2s/v2.0/task/mu-transfer`) — Transfers makeup from a reference image to a target selfie

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Perfect Corp YouCam API** (Skin Analysis + Makeup Transfer)
- Vanilla CSS (glassmorphism dark theme, mobile-first)
- No external UI framework dependencies

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Perfect Corp API key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or in a mobile-sized browser window.

## Environment Variables

| Variable | Description |
|---|---|
| `PERFECT_CORP_API_KEY` | Your YouCam API key from [yce.perfectcorp.com](https://yce.perfectcorp.com) |

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── skin-analysis/route.ts   # Proxies to Perfect Corp Skin Analysis API
│   │   └── makeup-transfer/route.ts # Proxies to Perfect Corp Makeup Transfer API
│   ├── layout.tsx
│   ├── page.tsx                     # Main SPA with tab navigation
│   └── globals.css                  # Design system
├── components/
│   ├── BottomNav.tsx
│   ├── ImageUpload.tsx
│   ├── ProductCard.tsx
│   └── ScoreRing.tsx
├── views/
│   ├── HomeView.tsx
│   ├── AnalyzeView.tsx
│   ├── ProductsView.tsx
│   └── TryOnView.tsx
└── lib/
    ├── types.ts                     # Shared types and helpers
    └── products.ts                  # Product database and matching algorithm
```

## Rate Limiting

The app implements conservative rate limiting to preserve API units:
- Skin Analysis: 3 requests per minute per IP
- Makeup Transfer: 2 requests per minute per IP
- Polling uses exponential backoff (2s → 5s intervals)

## License

MIT
