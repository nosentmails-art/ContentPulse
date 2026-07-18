# 📦 BACKEND DELIVERY CHECKLIST FOR YOUR FRIEND

**Prepared For:** Backend Team Integration  
**Document:** Complete backend deliverables list  
**Frontend Status:** Ready, waiting for backend merge

---

## 🎯 WHAT BACKEND MUST DELIVER

This is the complete list of files, directories, and code that the backend team must provide when they merge to main.

---

## 📁 DIRECTORY STRUCTURE

Backend team must create these directories:

```
app/api/                          ← NEW DIRECTORY
lib/agents/                       ← NEW DIRECTORY  
lib/connectors/                   ← NEW DIRECTORY
prisma/migrations/                ← NEW DIRECTORY (might already exist)
```

---

## 📄 FILE CHECKLIST

### 1. API Routes — `/app/api/` (11 files)

#### Route Group: `/api/tenants/`
- [ ] `app/api/tenants/route.ts`
  - `GET /api/tenants` — List all tenants
  - Response: `Array<{ id, name, slug }>`

#### Route Group: `/api/[tenant]/agents/`
- [ ] `app/api/[tenant]/agents/route.ts`
  - `GET /api/[tenant]/agents` — List agents for tenant
  - Response: `Array<Agent with attributes and latest run>`

- [ ] `app/api/[tenant]/agents/[agentType]/route.ts`
  - `PATCH /api/[tenant]/agents/[agentType]` — Toggle agent status
  - Request body: `{ status: "ENABLED" | "DISABLED" }`
  - Response: `Agent object`

#### Route Group: `/api/[tenant]/agents/[agentType]/attributes/`
- [ ] `app/api/[tenant]/agents/[agentType]/attributes/[key]/route.ts`
  - `PATCH /api/[tenant]/agents/[agentType]/attributes/[key]` — Toggle attribute
  - Request body: `{ value: boolean }`
  - Response: `AgentAttribute object`

#### Route Group: `/api/[tenant]/agents/[agentType]/run/`
- [ ] `app/api/[tenant]/agents/[agentType]/run/route.ts`
  - `POST /api/[tenant]/agents/[agentType]/run` — Trigger agent run
  - Response (202): `{ id, status: "pending", message }`

#### Route Group: `/api/[tenant]/agents/[agentType]/runs/`
- [ ] `app/api/[tenant]/agents/[agentType]/runs/route.ts`
  - `GET /api/[tenant]/agents/[agentType]/runs` — Get latest run status
  - Response (200): Latest run or (404) if no runs
  - Response: `{ id, status, result, error, startedAt, endedAt }`

#### Route Group: `/api/[tenant]/upload/`
- [ ] `app/api/[tenant]/upload/route.ts`
  - `POST /api/[tenant]/upload` — Upload CSV/Excel file
  - Request: `multipart/form-data` with `file` field
  - Response (202): `{ message, fileName, size, itemsCreated }`

#### Route Group: `/api/[tenant]/connect/`
- [ ] `app/api/[tenant]/connect/route.ts`
  - `GET /api/[tenant]/connect/status` — Connector status
  - Response: `{ connected, contentItemsCount, channels, metrics }`

#### Route Group: `/api/[tenant]/connect/template/`
- [ ] `app/api/[tenant]/connect/template/[channel]/route.ts`
  - `GET /api/[tenant]/connect/template/[channel]` — CSV template download
  - Response: CSV file (text/csv) with headers

#### Route Group: `/api/[tenant]/report/`
- [ ] `app/api/[tenant]/report/route.ts`
  - `GET /api/[tenant]/report` — Aggregated intelligence report
  - Response: `{ tenantId, tenantName, generatedAt, agents, contentStatistics, competitors }`

#### Route Group: `/api/[tenant]/competitors/`
- [ ] `app/api/[tenant]/competitors/route.ts`
  - `GET /api/[tenant]/competitors` — List competitors
  - Response: `Array<Competitor>`
  - `POST /api/[tenant]/competitors` — Add competitor
  - Request body: `{ name, url?, notes? }`
  - Response (201): `Competitor object`

---

### 2. Agent Analyzers — `/lib/agents/` (9 files)

- [ ] `lib/agents/llm.ts` — LLM integration (CodeBenders placeholder)
  - Export: `callLLM(prompt, context)` → Promise<LLMResponse>
  - Export: `generateFallbackInsights(agentType, data)` → LLMResponse
  - Includes placeholder for real CodeBenders API calls

- [ ] `lib/agents/audienceBehavior.ts` — Audience Behavior Agent
  - Export: `analyzeAudienceBehavior(tenantId, attributes?)` 
  - Returns: `AudienceBehaviorResult`

- [ ] `lib/agents/channelPerformance.ts` — Channel Performance Agent
  - Export: `analyzeChannelPerformance(tenantId, attributes?)`
  - Returns: `ChannelPerformanceResult`

- [ ] `lib/agents/sentimentAnalysis.ts` — Sentiment Analysis Agent
  - Export: `analyzeSentiment(tenantId, attributes?)`
  - Returns: `SentimentAnalysisResult`

- [ ] `lib/agents/contentGaps.ts` — Content Gaps Agent
  - Export: `analyzeContentGaps(tenantId, attributes?)`
  - Returns: `ContentGapsResult`

- [ ] `lib/agents/competitorBenchmarking.ts` — Competitor Benchmarking Agent
  - Export: `analyzeBenchmarking(tenantId, attributes?)`
  - Returns: `CompetitorBenchmarkingResult`

- [ ] `lib/agents/engagementOptimizer.ts` — Engagement Optimizer Agent
  - Export: `analyzeEngagementOptimization(tenantId, attributes?)`
  - Returns: `EngagementOptimizerResult`

- [ ] `lib/agents/trendSpotter.ts` — Trend Spotter Agent
  - Export: `analyzeAndSpotTrends(tenantId, attributes?)`
  - Returns: `TrendSpotterResult`

- [ ] `lib/agents/index.ts` — Agent registry
  - Export: `agentAnalyzers` object mapping agent types to analyzer functions
  - Export: All result types

---

### 3. File Parser — `/lib/connectors/` (1 file)

- [ ] `lib/connectors/parseUpload.ts` — CSV/Excel parser
  - Export: `parseFile(file: File)` → Promise<ParsedContentRow[]>
  - Export: `parseCSV(content: string)` → Promise<ParsedContentRow[]>
  - Export: `parseExcel(buffer: Buffer)` → Promise<ParsedContentRow[]>
  - Supports channels: LINKEDIN, YOUTUBE, BLOG, EMAIL, REDDIT, GOOGLE_PPC
  - Uses: Papa Parse (CSV), SheetJS (Excel)

---

### 4. Database Connection — `/lib/` (1 file)

- [ ] `lib/db.ts` — Prisma singleton
  - Export: `db` (PrismaClient instance)
  - Development logging enabled
  - Production-safe singleton pattern

---

### 5. Prisma Configuration — `/prisma/` (3 items)

- [ ] `prisma/schema.prisma` — Full database schema
  - Models: Tenant, Agent, AgentAttribute, AgentRun, ContentItem, ChannelMetrics, Competitor
  - All relationships with cascade deletes
  - Proper indexes

- [ ] `prisma/seed.ts` — Demo data seeder
  - Creates: 2 tenants (DevInsights Blog, GrowthStack Weekly)
  - Creates: 7 agents per tenant × 2 = 14 total
  - Creates: 2-3 attributes per agent
  - Cleans up existing data before seeding

- [ ] `prisma/migrations/` — Database migrations
  - At least 1 migration file (e.g., `20260718170252_init`)
  - Contains: CREATE TABLE statements for all 7 models
  - Contains: Indexes and foreign key constraints

---

## 📋 RESPONSE INTERFACE SPECIFICATIONS

All endpoints must return these exact TypeScript interfaces:

### Agent Response
```typescript
{
  id: string;
  tenantId: string;
  type: string; // AgentType enum value
  status: string; // "ENABLED" | "DISABLED"
  createdAt: Date;
  updatedAt: Date;
  attributes?: Array<{
    id: string;
    agentId: string;
    key: string;
    label: string;
    value: boolean;
  }>;
  runs?: Array<{
    id: string;
    status: string;
    result?: string; // JSON stringified
    error?: string;
    startedAt?: Date;
    endedAt?: Date;
  }>;
}
```

### Report Response
```typescript
{
  tenantId: string;
  tenantName: string;
  generatedAt: string;
  agents: Record<string, {
    latestRun?: {
      completedAt: Date;
      insights: any;
    };
  }>;
  contentStatistics: Array<{
    channel: string;
    itemCount: number;
  }>;
  competitors: Array<{
    id: string;
    name: string;
    url?: string;
    notes?: string;
  }>;
}
```

---

## 🗄️ DATABASE REQUIREMENTS

Backend must create and seed:

### Tenants
```
1. name: "DevInsights Blog", slug: "devinsights"
2. name: "GrowthStack Weekly", slug: "growthstack"
```

### Agents (per Tenant)
```
- AUDIENCE_BEHAVIOR
- CHANNEL_PERFORMANCE
- SENTIMENT_ANALYSIS
- CONTENT_GAPS
- COMPETITOR_BENCHMARKING
- ENGAGEMENT_OPTIMIZER
- TREND_SPOTTER
```

### Attributes (per Agent)
```
Each agent should have 2-3 attributes like:
- key: "include_keywords", label: "Include Keyword Analysis", value: true
- key: "track_demographics", label: "Track Demographics", value: true
```

---

## 📚 DOCUMENTATION REQUIREMENTS

Backend team should provide:

- [ ] `BACKEND_API_REFERENCE.md` — API endpoint documentation
- [ ] `AGENTS_IMPLEMENTATION_GUIDE.md` — How agents work
- [ ] Updated `.env.example` with all required variables
- [ ] Seed instructions in `README.md`
- [ ] Author attribution in all backend files

---

## 🔐 ENVIRONMENT VARIABLES

Backend should add to `.env.example`:

```env
# Database
DATABASE_URL=file:./prisma/dev.db

# LLM Integration (CodeBenders)
CODEBENDERS_API_KEY=your_api_key_here

# File Upload (if applicable)
MAX_FILE_SIZE=52428800  # 50MB

# Optional
NODE_ENV=development
DEBUG=true
```

---

## ✅ QUALITY CHECKLIST

Backend team should ensure:

- [ ] All TypeScript code is strict mode
- [ ] All endpoints return proper HTTP status codes:
  - 200 OK (GET success)
  - 201 Created (POST success)
  - 202 Accepted (async operations)
  - 400 Bad Request (validation error)
  - 404 Not Found (resource not found)
  - 500 Internal Server Error (server error)
- [ ] Error messages are user-friendly JSON
- [ ] All database relationships have cascade deletes
- [ ] Proper indexes on frequently queried columns
- [ ] Prisma migrations are tested
- [ ] Demo data seeding is idempotent (safe to run multiple times)
- [ ] All response types match frontend expectations

---

## 🧪 TESTING REQUIREMENTS

After building backend, test:

- [ ] Each endpoint with different HTTP methods
- [ ] Tenant isolation (can't see other tenant's data)
- [ ] Agent status changes persist
- [ ] File uploads create ContentItem records
- [ ] Report aggregates agent run results
- [ ] Seed data creates correct structure
- [ ] All 11 endpoints return expected response format

---

## 📋 INTEGRATION TESTING

Once backend merges to main, frontend team will test:

- [ ] GET /api/tenants → renders TenantSwitcher
- [ ] GET /api/[tenant]/agents → renders AgentCard components
- [ ] PATCH agent status → card updates
- [ ] POST agent run → status changes to "running"
- [ ] GET runs endpoint → shows latest result
- [ ] POST upload → creates ContentItem
- [ ] GET report → renders ReportSection components

---

## 🚀 DEPLOYMENT REQUIREMENTS

Backend must support:

- [ ] Running on localhost:3000 (frontend expects this)
- [ ] CORS headers for frontend requests
- [ ] SQLite database (portable for hackathon)
- [ ] `npm run dev` starts the server
- [ ] `npm run build` creates production build
- [ ] Environment variables from `.env` file

---

## 📝 AUTHOR ATTRIBUTION

All backend files should include:

```typescript
/**
 * [File Description]
 * @author [Your Friend's Name]
 * 
 * [Brief description of purpose]
 */
```

---

## 🎯 SUCCESS CRITERIA

Backend PR is ready to merge when:

- ✅ All 11 API routes implemented and tested
- ✅ All 7 agents implemented and returning data
- ✅ File parser integrated and working
- ✅ Prisma schema created and migrations applied
- ✅ Database seeded with demo data
- ✅ All endpoints return correct response format
- ✅ Error handling implemented
- ✅ Documentation complete
- ✅ Author attribution in all files
- ✅ No breaking changes to frontend code

---

## 📞 QUESTIONS FOR BACKEND TEAM

When they're ready to PR, ask:

1. "Are all 11 endpoints ready?"
2. "Did you seed the 2 demo tenants?"
3. "Are agent analyzers returning structured data?"
4. "Is file upload creating ContentItem records?"
5. "Can the report endpoint aggregate agent results?"
6. "Are all response types matching frontend expectations?"

---

**This checklist ensures smooth integration once backend merges to main.**

**Status:** ✅ Frontend ready and waiting for backend delivery
