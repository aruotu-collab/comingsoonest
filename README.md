# comingsoonest.com

Launch intelligence network — **Watch what’s next.**

Built from the ChatGPT “Coming Soon Product Strategy” thread: Next Pulse, WATCH, Calendar (future + On This Day), Radar, Live tape, My Future, Fragrance Radar, rankings, brand follow/claim, scouts, Plus tiers, and Intelligence B2B surfaces.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Seeded Launch domain model in `src/data/seed.ts`
- Watch / watch-rules persisted via httpOnly cookies

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core loop

Discover → Watch → change detected (Live) → alert prefs → return (My Future / Calendar)
