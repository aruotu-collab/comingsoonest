# comingsoonest.com

Launch intelligence network — **Watch what’s next.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Launch catalogue: demo seed in `src/data/seed.ts` + imported batch in `src/data/catalogue.generated.ts` (from `data/comingsoonest_seed_599.csv`)
- **Postgres** (Prisma) for users, sessions, watches, rules, change events, alert log
- **Resend** for launch alert emails
- Vercel Cron → `/api/cron/alerts` (daily on Hobby)

## Run

```bash
npm install
cp .env.example .env.local   # then fill real values
npx prisma migrate dev
npm run db:seed
npm run dev
```

Re-import the ChatGPT catalogue CSV after updating `data/comingsoonest_seed_599.csv`:

```bash
npm run catalogue:import
```
Open [http://localhost:3000](http://localhost:3000).

## Core loop

1. Click **Watch** → enter email (creates session + Postgres watch)
2. Open **Watching** / **My Future** (or sign in with the same email on Watching)
3. Cron (or `POST /api/alerts/test`) matches new `ChangeEvent`s → emails watchers

## What is backed up where

| Data | Where it lives | Risk if only local |
|------|----------------|--------------------|
| App source code | GitHub `main` | Lost if never pushed |
| DB schema / migrations | GitHub `prisma/` | Lost if migrations deleted |
| Watches, users, sessions | Prisma Postgres | Not in git — protected by Prisma/Vercel |
| Secrets (`DATABASE_URL`, Resend, etc.) | Vercel env + `.env.local` | Never commit; restore from Vercel |

`main` is protected on GitHub: no force-push and the branch cannot be deleted.

## Important

- Keep `.env.local` out of git (already gitignored). Use `.env.example` as the checklist.
- Production secrets live in the Vercel project — pull with `npx vercel env pull` if you need a new machine.
- Claim / keep the Prisma Postgres project active so watch data is not wiped.