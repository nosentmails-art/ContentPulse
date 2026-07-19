# ContentPulse — Full Gap Analysis (19 Jul 2026)

**Run performed on:** 19 Jul 2026  
**Repo:** `C:\Users\handi\CascadeProjects\ContentPulse`

## TL;DR

TypeScript and basic UI wiring are now clean, but the app is still not demo-ready. The frontend still falls back to mock data, several backend-wiring gaps remain, the unified report still ignores backend `synthesis`, and the dev server is not actually running. The database is now seeded (`118 KB`), so the backend should work once the server is started.

---

## Verification Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `prisma/dev.db` | ✅ 118,784 bytes (seeded) |
| Server on `localhost:3000` | ❌ Not listening |
| Server on `localhost:3001` | ❌ Not listening |
| `GET /api/devinsights/agents` | ❌ Connection refused |
| `GET /api/devinsights/report` | ❌ Connection refused |
| `GET /api/devinsights/connect/status` | ❌ Connection refused |

---

## ✅ What is actually fixed

- `npx tsc --noEmit` passes cleanly.
- `app/[tenant]/connect/page.tsx` JSX ordering is now correct.
- Connect page upload handler POSTs to `/api/{tenant}/upload` and updates `channelStatus`.
- Dashboard fetches agents from `/api/{tenant}/agents` and renders `AgentCard`.
- Dashboard single-agent run calls `/api/{tenant}/agents/{type}/run` and refetches.
- `globals.css` has a complete `@media print` block.
- `app/page.tsx` business labels are clean.
- The SQLite database is now seeded and non-empty.

---

## ❌ Critical gaps remaining

### 1. The dev server is not running

- `Get-Process node` returned nothing.
- Ports `3000` and `3001` are not listening.
- Every API call returns `Unable to connect to the remote server`.
- **Action:** Start `npm run dev` and re-test the three endpoints.

### 2. `app/[tenant]/report/page.tsx` still initializes from mock data

- Line 116: `const [reportData, setReportData] = useState<any>(MOCK_REPORT_DATA);`
- Lines 19-111 still define `MOCK_REPORT_DATA`.
- **Impact:** If the API call fails or the server is not running, the user sees fake data instead of an error/empty state.
- **Action:** Initialize with `null`, render a real loading/empty/error state, and delete `MOCK_REPORT_DATA`.

### 3. Report page ignores the backend `synthesis`

- `/api/{tenant}/report` returns `{ tenant, generatedAt, synthesis, agents }`.
- The page transforms `agents` but does not store or render `synthesis`.
- **Missing from UI:** `acquisitionStrategy`, `keyMetrics`, `priorityOpportunities`, `nextActions`.
- **Action:** Add `reportData.synthesis` rendering at the top of the report.

### 4. `app/[tenant]/page.tsx` still uses `MOCK_TENANTS`

- Lines 20-23 define `MOCK_TENANTS`.
- Line 146 passes `MOCK_TENANTS` to `TenantSwitcher`.
- **Action:** Fetch `/api/tenants` and pass real tenant data, or remove `TenantSwitcher` if not needed.

### 5. `app/[tenant]/agents/[agentType]/page.tsx` still hardcodes agent metadata

- Lines 36-96 define `DEFAULT_AGENT_CONFIG` with names, descriptions, and default attributes.
- Lines 198-199 use `agentConfig.name` and `agentConfig.description` instead of the API `agentData` values.
- Line 240 dumps raw JSON inside a `<pre>`:
  ```tsx
  {JSON.stringify(JSON.parse(agentData.latestRun.resultJson), null, 2)}
  ```
- **Action:** Use `agentData.name`, `agentData.description`, `agentData.attributes` from the API and render `resultJson` in readable components/cards.

### 6. `components/ReportSection.tsx` is not typed and can emit `[object Object]`

- Line 12: `data: any`
- Lines 103-109 use `String(row[key] ?? "")`.
- **Impact:** When the backend returns shapes that do not match the old mock data, nested objects print as `[object Object]`.
- **Action:** Make `data` a typed union and add a safe `renderString` helper that refuses to render `[object Object]`.

### 7. Report page is missing `CONTENT_ANALYTICS`

- The page renders `SentimentScoreCard`, `OpportunityCard`, and `ReportSection` for audience, channel, gap, and competitor.
- It never renders the `CONTENT_ANALYTICS` section.
- **Action:** Add a `ReportSection` for `CONTENT_ANALYTICS`.

### 8. `ReportSection` default branch does not handle all agent types

- The `switch` only has cases for `AUDIENCE_INTELLIGENCE`, `CHANNEL_CONTENT_INTELLIGENCE`, `GAP_ANALYSIS`, and `COMPETITOR_ANALYSIS`.
- `SENTIMENT_ANALYSIS` and `OPPORTUNITY_IDENTIFICATION` fall into the generic default branch.
- **Action:** Either add dedicated renderers or keep `SentimentScoreCard`/`OpportunityCard` wrappers and make the default branch fail gracefully.

### 9. `TenantSwitcher` likely still consumes mock tenant data

- Because `page.tsx` passes `MOCK_TENANTS`, the switcher is not driven by `/api/tenants`.
- **Action:** Wire `TenantSwitcher` to `/api/tenants`.

---

## ⚠️ Secondary / polish gaps

1. `handleTemplateDownload` in `connect/page.tsx` uses a fake `setTimeout` and does not actually download anything. It is acceptable for a demo, but it is not a real feature.
2. The agent detail `<pre>` JSON dump is not demo-friendly.
3. Upload endpoint shape: `handleFileUpload` appends `channel` as a form field, not a query parameter. Verify `/api/{tenant}/upload` expects `body.get("channel")`.
4. Re-scan user-facing strings for `Multi-Agent`, `orchestrate`, `deploy`, `AI agents` after code changes.

---

## Immediate next steps

1. Start the server:
   ```bash
   npm run dev
   ```
2. Verify endpoints return real data:
   ```bash
   curl http://localhost:3000/api/devinsights/agents
   curl http://localhost:3000/api/devinsights/report
   curl http://localhost:3000/api/devinsights/connect/status
   ```
3. Remove `MOCK_REPORT_DATA` and `MOCK_TENANTS`.
4. Render `synthesis` on the report page.
5. Replace the agent-detail JSON dump with readable cards/tables.
6. Type `ReportSection` and guard against `[object Object]`.

Once those are completed, the app will be backend-driven and ready for end-to-end demo verification.
