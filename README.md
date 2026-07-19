# ContentPulse

> AI-powered content intelligence platform for editorial teams

ContentPulse helps content teams make data-driven decisions by analyzing performance across multiple channels. Upload your content data, run AI-powered analysis agents, and get actionable insights on audience behavior, channel performance, sentiment, and content gaps.

---

## Features

- **Multi-tenant Architecture**: Isolated workspaces for different brands or projects
- **AI-Powered Analysis**: 7 specialized agents analyzing different aspects of content performance
- **Multi-Channel Support**: LinkedIn, YouTube, Blog, Email Newsletter, Reddit, Google PPC
- **CSV Data Import**: Upload exported data from any platform
- **Intelligence Reports**: Structured AI-generated insights with actionable recommendations
- **Persona-Level Analysis**: Understand how different audience segments engage with content
- **Gap & Opportunity Analysis**: Identify content gaps and high-impact opportunities
- **Competitor Intelligence**: Compare your content strategy against competitors

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | SQLite via Prisma ORM |
| File Parsing | Papa Parse (CSV) + SheetJS (Excel) |
| AI | GROQ, OpenAI, Gemini (with fallback to mock data) |
| State Management | React Hooks |
| UI Components | Custom components with Lucide icons |

---

## Getting Started

### For Hackathon Evaluators

The repository includes pre-seeded demo data and works with or without API keys:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file (this is the only file you need to update)
cp .env.example .env.local

# 3. (Optional) Add your LLM API keys to .env.local
# If left empty, the app will use mock data for demonstration
# Update only these lines in .env.local:
# GROQ_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Access:**
- Navigate to any tenant URL (e.g., `/devinsights`, `/growthstack`, `/techcrunch`, etc.)
- Click "Generate Content Plan" to run AI agents on demo data
- Works with mock data automatically if no API keys are provided

### For Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local and configure your LLM API keys (GROQ, OpenAI, or Gemini)

# 3. Set up database
npx prisma db push

# 4. Seed demo data
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# LLM API Keys (configure at least one)
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=https://api.openai.com/v1

# Gemini (optional)
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-flash-latest
```

---

## Project Structure

```
ContentPulse/
├── app/
│   ├── [tenant]/             # Tenant-specific pages
│   │   ├── page.tsx          # Agent dashboard
│   │   ├── connect/          # Data upload interface
│   │   ├── agents/           # Agent detail pages
│   │   └── report/           # Unified intelligence report
│   ├── api/                  # API routes
│   │   └── [tenant]/         # Tenant-specific endpoints
│   └── page.tsx              # Landing page
├── components/               # Reusable UI components
│   ├── AgentCard.tsx
│   ├── ReportSection.tsx
│   ├── GapAnalysisCard.tsx
│   ├── StatusBadge.tsx
│   └── TenantSwitcher.tsx
├── lib/
│   ├── agents/               # AI analysis logic
│   │   ├── content-analytics.ts
│   │   ├── audience-intelligence.ts
│   │   ├── channel-intelligence.ts
│   │   ├── sentiment-analysis.ts
│   │   ├── competitor-analysis.ts
│   │   ├── gap-analysis.ts
│   │   └── llm-helper.ts
│   ├── connectors/           # Data import parsers
│   └── db.ts                 # Prisma client
└── prisma/
    ├── schema.prisma         # Database schema
    └── seed.ts              # Demo data seeding
```

---

## AI Agents

ContentPulse includes 7 specialized analysis agents:

1. **Content Analytics** - Overall performance metrics across channels
2. **Audience Intelligence** - Demographic insights and persona-level analysis
3. **Channel Intelligence** - Channel-specific performance and recommendations
4. **Sentiment Analysis** - Audience sentiment and feedback themes
5. **Competitor Analysis** - Competitive positioning and content gaps
6. **Gap Analysis** - Strategy gaps and recommended opportunities
7. **Opportunity Identification** - High-impact content opportunities with urgency ranking

Each agent can be toggled on/off and has configurable attributes for customization.

---

## Demo Data

The seed script creates 10 demo tenants with sample content:

| Tenant | URL | Niche |
|--------|-----|-------|
| DevInsights Blog | /devinsights | Developer education |
| GrowthStack Weekly | /growthstack | B2B SaaS marketing |
| TechCrunch Clone | /techcrunch | Technology news |
| Marketing Daily | /marketingdaily | Digital marketing |
| DevTools Hub | /devtoolshub | Developer tools |
| Startup Weekly | /startupweekly | Startup advice |
| Cloud Insights | /cloudinsights | Cloud computing |
| AI Frontiers | /aifrontiers | Artificial intelligence |
| Data Science Daily | /datasciencedaily | Data science |
| Security Brief | /securitybrief | Cybersecurity |

Each tenant includes:
- Sample content items across multiple channels
- Competitor data
- Audience personas
- Configured agents with default attributes

---

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

---

## License

© 2026 ContentPulse. All rights reserved.
