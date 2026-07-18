# ContentPulse

> Multi-tenant, multi-agent AI content intelligence platform.

Clients upload content performance data from multiple channels. AI agents analyze the data and generate intelligence reports covering audience behavior, channel performance, sentiment, and content gaps.

---

## What It Does

- **Multi-tenant**: Each client has their own isolated workspace and agent configuration
- **Multi-agent**: 7 specialized AI agents — each toggleable, each with configurable attributes
- **Multi-channel**: LinkedIn, YouTube, Blog, Email Newsletter, Reddit, Google PPC
- **CSV-first**: Upload exported data from any platform. API connectors plug in later.
- **AI Reports**: Each agent produces a structured intelligence output powered by LLM

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Charts | Recharts |
| Database | SQLite via Prisma ORM |
| File Parsing | Papa Parse (CSV) + SheetJS (Excel) |
| AI | CodeBenders LLM |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env and set DATABASE_URL=file:./prisma/dev.db

# 3. Set up database
npx prisma db push

# 4. Seed demo data
npx prisma db seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Tenants

| Tenant | URL | Niche |
|--------|-----|-------|
| DevInsights Blog | /devinsights | Developer education |
| GrowthStack Weekly | /growthstack | B2B SaaS marketing |

---

## Project Structure

```
ContentPulse/
├── app/
│   ├── [tenant]/             # Tenant pages (frontend team)
│   │   ├── page.tsx          # Agent grid
│   │   ├── connect/          # Data upload
│   │   ├── agents/           # Agent management
│   │   └── report/           # Intelligence report
│   ├── api/                  # API routes (backend team)
│   │   └── [tenant]/
│   └── page.tsx              # Landing page
├── components/               # Shared UI components (frontend team)
├── lib/
│   ├── agents/               # AI analysis logic (backend team)
│   ├── connectors/           # CSV/file parsers (backend team)
│   └── db.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Team

- **Person A** — Frontend/UI → owns `/app/`, `/components/`
- **Person B** — Backend/API → owns `/lib/`, `/api/`, `/prisma/`

See `TEAM_SPLIT.md` for full ownership rules.

---

## Hackathon

Built during a 24-hour hackathon. See `DEMO_SCRIPT.md` for the presentation flow.
