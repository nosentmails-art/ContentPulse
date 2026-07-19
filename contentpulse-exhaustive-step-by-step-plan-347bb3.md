# ContentPulse — All Fixes, No Shortcuts (Execution Plan)

This is the single exhaustive reference for fixing ContentPulse. It is **not** a priority subset. Work top-to-bottom, stop at every gate, and do not declare completion until the last gate passes.

---

## Gate 0 — Current Reality Check

Before touching code, verify these facts. If any fail, fix them before proceeding.

1. Open `C:\Users\handi\CascadeProjects\ContentPulse\prisma\dev.db` and confirm it is **not** `0 bytes`.
2. Open a browser or `curl` and call `http://localhost:3000/api/devinsights/agents` (or `3001` if running there).
3. Run `npx tsc --noEmit` and confirm `0` errors.

If `dev.db` is `0 bytes`, the app can be 100% frontend-perfect and still fail. Fix the database first.

---

## Phase 1 — Database and Backend Foundation

### 1.1 Prisma setup

Run these commands from the repo root:

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

- If `migrate dev` warns about data loss, accept only if `dev.db` is empty.
- If `db seed` fails, read the error and fix `prisma/seed.ts` before re-running.

### 1.2 Verify backend endpoints

After seeding, in a separate terminal:

```bash
# Should return a JSON object with an "agents" array
curl http://localhost:3000/api/devinsights/agents

# Should return a JSON object with "synthesis" and "agents"
curl http://localhost:3000/api/devinsights/report

# Should return a JSON object with "channels"
curl http://localhost:3000/api/devinsights/connect/status
```

Do not move to Phase 2 until all three return `200` with real data.

### 1.3 Server restart

After any backend change:

```bash
# If you changed prisma schema, restart is mandatory
npx prisma generate
npm run dev
```

---

## Phase 2 — TypeScript and JSX Blockers

Run `npx tsc --noEmit`. Do not continue until it prints `Found 0 errors`.

### 2.1 `app/[tenant]/connect/page.tsx` JSX ordering

The `Tabs`, `TabsList`, `TabsContent`, and `Connection Methods` grid must be in this exact nesting inside the `return`:

```tsx
<div className="container-page py-12">
  <div className="max-w-4xl">
    {/* Intro text */}
    <Tabs defaultValue="LINKEDIN" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 ...">
        {CHANNELS.map((channel) => (
          <TabsTrigger key={channel} value={channel} ...>
            {CHANNEL_LABELS[channel]}
          </TabsTrigger>
        ))}
      </TabsList>
      {CHANNELS.map((channel) => (
        <TabsContent key={channel} value={channel}>
          <ChannelUploadTab ... />
        </TabsContent>
      ))}
    </Tabs>

    {/* Connection Methods grid after </Tabs>, not inside it */}
    <div className="mt-12 grid gap-4 md:grid-cols-2">
      <div>Manual Upload card</div>
      <div>API Connection card</div>
    </div>
  </div>
</div>
```

### 2.2 Any remaining `tsc` errors

- No `any` used to hide type errors.
- No unused imports or variables.
- No duplicate declarations.

Gate: `npx tsc --noEmit` must pass.

---

## Phase 3 — Dashboard (`app/[tenant]/page.tsx`)

### 3.1 Remove all hardcoded tenant and agent data

Delete `MOCK_TENANTS` and any remaining `MOCK_*` arrays from the file.

### 3.2 Load real agents from the backend

```tsx
useEffect(() => {
  fetch(`/api/${tenantSlug}/agents`)
    .then((res) => res.json())
    .then((data) => {
      if (data.agents) {
        setAgents(data.agents);
      } else {
        setError("Failed to load agents");
      }
    })
    .catch(() => setError("Failed to load agents"));
}, [tenantSlug]);
```

### 3.3 Render `AgentCard` from API data

Map every agent field:

```tsx
{agents.map((agent) => (
  <AgentCard
    key={agent.id}
    agentType={agent.type}
    name={agent.name}
    description={agent.description}
    enabled={agent.enabled}
    status={agent.latestRun?.status ?? "IDLE"}
    attributes={agent.attributes}
    lastRun={agent.latestRun?.completedAt ? new Date(agent.latestRun.completedAt).toLocaleString() : null}
    detailHref={`/${tenantSlug}/agents/${agent.type.toLowerCase()}`}
    onToggle={() => handleAgentToggle(agent.type)}
    onAttributeToggle={(key) => handleAttributeToggle(agent.type, key)}
    onRun={() => handleRunAgent(agent.type)}
  />
))}
```

### 3.4 Run a single agent

```tsx
const handleRunAgent = async (agentType: string) => {
  setRunningAgents((prev) => new Set([...prev, agentType]));
  const id = toast.loading(`Analyzing ${agentType}...`);
  try {
    const res = await fetch(`/api/${tenantSlug}/agents/${agentType.toLowerCase()}/run`, {
      method: "POST",
    });
    toast.dismiss(id);
    if (!res.ok) {
      toast.error(`${agentType} failed`);
      return;
    }
    toast.success(`${agentType} complete`);
    const updated = await fetch(`/api/${tenantSlug}/agents`).then((r) => r.json());
    setAgents(updated.agents ?? []);
  } catch (e) {
    toast.dismiss(id);
    toast.error(`${agentType} failed`);
  } finally {
    setRunningAgents((prev) => {
      const next = new Set(prev);
      next.delete(agentType);
      return next;
    });
  }
};
```

### 3.5 Run all enabled agents

```tsx
const handleRunAllEnabled = async () => {
  const enabled = agents.filter((a) => a.enabled);
  const id = toast.loading(`Analyzing ${enabled.length} agents...`);
  for (const agent of enabled) {
    setRunningAgents((prev) => new Set([...prev, agent.type]));
    try {
      await fetch(`/api/${tenantSlug}/agents/${agent.type.toLowerCase()}/run`, { method: "POST" });
      const updated = await fetch(`/api/${tenantSlug}/agents`).then((r) => r.json());
      setAgents(updated.agents ?? []);
    } catch (e) {
      toast.error(`${agent.type} failed`);
    } finally {
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agent.type);
        return next;
      });
    }
  }
  toast.dismiss(id);
  toast.success("All analyses complete");
};
```

Gate: Dashboard loads real agents from `GET /api/{tenant}/agents` and a single `Analyze Now` call creates a real `AgentRun` in Prisma.

---

## Phase 4 — Agent Detail Page (`app/[tenant]/agents/[agentType]/page.tsx`)

### 4.1 Remove all mock data

Delete `AGENT_DETAILS` and `MOCK_RUNS`.

### 4.2 Load the agent from the backend

```tsx
useEffect(() => {
  fetch(`/api/${tenantSlug}/agents`)
    .then((res) => res.json())
    .then((data) => {
      const found = data.agents?.find((a: any) => a.type === agentType.toUpperCase());
      if (found) {
        setAgentData(found);
        setAttributes(found.attributes);
        setRuns(found.runs || []);
        setAgentStatus(found.latestRun?.status ?? "IDLE");
      }
    });
}, [tenantSlug, agentType]);
```

### 4.3 Run button

Use the same `handleRun` pattern as the dashboard, then refetch the agent.

### 4.4 Latest result

If `runs[0]?.resultJson` exists, parse it and render the parsed object. Do not dump `JSON.stringify` in the final UI.

Gate: Agent detail loads real data and running it updates `runs` from the backend.

---

## Phase 5 — Report Page (`app/[tenant]/report/page.tsx`)

### 5.1 Delete `MOCK_REPORT_DATA`

Remove the object and the `useState<any>(MOCK_REPORT_DATA)` initializer.

### 5.2 Load from the API with an empty initial state

```tsx
const [reportData, setReportData] = useState<any>(null);

useEffect(() => {
  fetch(`/api/${tenantSlug}/report`)
    .then((res) => res.json())
    .then((data) => {
      if (data.synthesis) {
        setReportData(data);
      } else {
        setError("No report available. Run agents first.");
      }
    })
    .catch(() => setError("Failed to load report"));
}, [tenantSlug]);
```

### 5.3 Render synthesis

At the top of the report, render:

- `reportData.synthesis.acquisitionStrategy` as a hero takeaway.
- `reportData.synthesis.keyMetrics` as small metric cards.
- `reportData.synthesis.priorityOpportunities` as ranked opportunity cards.
- `reportData.synthesis.nextActions` as a numbered list.

### 5.4 Render agent sections

```tsx
{reportData.agents?.map((agent) => (
  <ReportSection
    key={agent.type}
    agentType={agent.type}
    title={agent.name}
    data={agent.result}
    status={agent.status}
  />
))}
```

If `reportData` is null, show:

```tsx
<div className="card text-center py-12">
  <p className="text-slate-400">Run agents on the dashboard to generate this report.</p>
</div>
```

Gate: `/report` shows real data from the API. No mocks are rendered and no section is blank without explanation.

---

## Phase 6 — `components/ReportSection.tsx`

### 6.1 No `JSON.stringify` in final UI

Remove any `JSON.stringify(value)` or `String(...)` fallback that produces `[object Object]`. Use per-agent renderers.

### 6.2 Typed dispatch

```tsx
export function ReportSection({ agentType, title, data, status }: ReportSectionProps) {
  if (!data || status !== "COMPLETED") {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-400">
          Analyze <span className="font-semibold">{agentNames[agentType]}</span> to see this section
        </p>
      </div>
    );
  }

  switch (agentType) {
    case "CONTENT_ANALYTICS":
      return renderContentAnalytics(title, data);
    case "AUDIENCE_INTELLIGENCE":
      return renderAudienceIntelligence(title, data);
    case "CHANNEL_CONTENT_INTELLIGENCE":
      return renderChannelIntelligence(title, data);
    case "SENTIMENT_ANALYSIS":
      return renderSentimentAnalysis(title, data);
    case "GAP_ANALYSIS":
      return renderGapAnalysis(title, data);
    case "COMPETITOR_ANALYSIS":
      return renderCompetitorAnalysis(title, data);
    case "OPPORTUNITY_IDENTIFICATION":
      return renderOpportunityIdentification(title, data);
    default:
      return (
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
          <p className="text-slate-400">Unknown agent type</p>
        </div>
      );
  }
}
```

### 6.3 Per-agent renderer requirements

**CONTENT_ANALYTICS**
- Show `summary` text.
- Render `metrics.channels` as a table: Channel, Count, Engagement.
- Show `metrics.totalContent`, `totalImpressions`, `totalEngagement`, `topChannel` as metric cards.

**AUDIENCE_INTELLIGENCE**
- Show `summary` and `topInsight`.
- Render `segments` as a table: Name, Description, Best Time, Top Content, Engagement Rate.
- Show `recommendation` as a callout.

**CHANNEL_CONTENT_INTELLIGENCE**
- Show `summary`.
- Render `matrix` as a table: Format, Channel, Performance Score, Key Metric, Verdict.
- Highlight `topCombo` and `avoidCombo` in separate boxes.

**SENTIMENT_ANALYSIS**
- Use `SentimentScoreCard` with `score`, `positiveThemes`, `negativeThemes`.
- Render actionable recommendations as a list if present.

**GAP_ANALYSIS**
- Show `summary` and `topRecommendation`.
- Render `gaps` as a table with a small coverage bar per row.

**COMPETITOR_ANALYSIS**
- Show `summary`.
- Render `competitors` as a comparison table.

**OPPORTUNITY_IDENTIFICATION**
- Use `OpportunityCard` grid.
- Show `summary` and `priorityAction`.

Gate: The `/report` page contains zero raw JSON dumps and zero `[object Object]` strings.

---

## Phase 7 — Connect/Upload Page (`app/[tenant]/connect/page.tsx`)

### 7.1 Load real channel status

```tsx
useEffect(() => {
  fetch(`/api/${tenantSlug}/connect/status`)
    .then((res) => res.json())
    .then((data) => {
      const mapped: Record<Channel, ChannelStatus> = {} as any;
      data.channels.forEach((c: any) => {
        mapped[c.channel as Channel] = {
          status: c.rowCount > 0 ? "loaded" : "empty",
          rowCount: c.rowCount,
          lastImport: c.lastImport ? new Date(c.lastImport).toLocaleString() : null,
        };
      });
      setChannelStatus(mapped);
    });
}, [tenantSlug]);
```

### 7.2 Upload files to the backend

```tsx
const handleFileUpload = async (channel: Channel, file: File) => {
  const id = toast.loading(`Uploading ${file.name}...`);
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`/api/${tenantSlug}/upload?channel=${channel}`, {
      method: "POST",
      body: formData,
    });
    toast.dismiss(id);
    if (!res.ok) throw new Error("Upload failed");
    toast.success(`${file.name} uploaded`);
    // Refetch status
    const status = await fetch(`/api/${tenantSlug}/connect/status`).then((r) => r.json());
    /* update channelStatus from status */
  } catch (e) {
    toast.dismiss(id);
    toast.error(`${file.name} upload failed`);
  }
};
```

Gate: Uploading a CSV increases the row count shown on the page after the refetch.

---

## Phase 8 — Toast Cleanup (Every `.tsx` File)

1. Search for `toast.loading(` across `app/` and `components/`.
2. Every instance must:
   - Capture the id: `const id = toast.loading("...")`
   - Call `toast.dismiss(id)` before `toast.success` or `toast.error`
3. Files to verify:
   - `app/[tenant]/page.tsx`
   - `app/[tenant]/report/page.tsx`
   - `app/[tenant]/agents/[agentType]/page.tsx`
   - `app/[tenant]/connect/page.tsx`

Gate: No toast notification lingers after the action finishes.

---

## Phase 9 — Print Styles (`app/globals.css`)

Append at the end of `app/globals.css`:

```css
@media print {
  html,
  body {
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
  }

  .no-print,
  button,
  a[href^="/"],
  .sticky,
  nav,
  footer {
    display: none !important;
  }

  .printable-report,
  .card {
    background: white !important;
    color: black !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
    break-inside: avoid;
  }

  .card h2,
  .card h3,
  .card p,
  .card span,
  .card th,
  .card td {
    color: black !important;
  }
}
```

Gate: `Ctrl+P` on `/report` shows a clean, black-on-white report with no buttons or header.

---

## Phase 10 — Business Labels (Final Sweep)

1. Search user-facing strings in `app/` for:
   - `Multi-Agent`
   - `orchestrate`
   - `deploy`
   - `AI agents` (as UI copy, not code identifiers)
2. Replace with business-value language from the previous rewrite list.
3. Code identifiers, agent types, function names remain unchanged.

Gate: No technical jargon appears in the rendered UI.

---

## Phase 11 — Final End-to-End Verification

Run in this order:

```bash
npx tsc --noEmit        # must be 0 errors
npm run dev
```

Then open the browser and test every flow without skipping:

1. `/` landing page loads.
2. Click `View Demo` → `/devinsights` loads real agents from DB.
3. Click `Analyze Now` on one agent → toast dismisses and status updates.
4. Go to `/devinsights/agents/audience_intelligence` → run the agent → result appears.
5. Go to `/devinsights/connect` → upload a CSV → row count updates.
6. Go to `/devinsights/report` → shows synthesis, tables, cards, no JSON.
7. Press `Ctrl+P` on `/report` → clean print preview.

Do not report the task complete until all 7 flows work.

---

## Final Rules for the Implementer

- No new npm dependencies unless absolutely necessary.
- Do not change the backend API shape. Adapt the frontend to the existing API.
- Do not keep mock fallbacks for production routes. Show explicit empty/error states.
- Run `npx tsc --noEmit` after every phase.
- Stop immediately on any error, paste the exact message, and fix it before continuing.
