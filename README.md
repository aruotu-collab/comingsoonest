# comingsoonest.com

Launch intelligence network — **Watch what’s next.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Launch catalogue seeded in `src/data/seed.ts`
- **Postgres** (Prisma) for users, sessions, watches, rules, change events, alert log
- **Resend** for launch alert emails
- Vercel Cron → `/api/cron/alerts` (daily on Hobby)

## Run

```bash
npm install
# ensure .env.local has DATABASE_URL, CRON_SECRET, optional RESEND_API_KEY
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core loop

1. Click **Watch** → enter email (creates session + Postgres watch)
2. Open **Watching** / **My Future**
3. Cron (or `POST /api/alerts/test`) matches new `ChangeEvent`s → emails watchers

## Important

- Claim the Prisma Postgres DB before it expires: see `CLAIM_URL` in `.env.local`
- Add `RESEND_API_KEY` for real email (without it, alerts log to the server console)
