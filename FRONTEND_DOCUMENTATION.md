/**
 * CONTENTPULSE FRONTEND DOCUMENTATION
 * @author sanat.k.mahapatra
 * 
 * Complete guide to the ContentPulse frontend architecture, components, 
 * and pages for the multi-tenant content intelligence platform.
 */

# ContentPulse Frontend Documentation

## Overview

ContentPulse is a multi-tenant, multi-agent content intelligence platform. This document covers the frontend implementation built with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui components.

**Current Status:** Frontend complete with all pages and components. Ready for backend API integration.

---

## Project Structure

```
ContentPulse/
├── app/
│   ├── layout.tsx                    # Root layout with Toaster
│   ├── globals.css                   # Global TailwindCSS styles
│   ├── page.tsx                      # Landing page (/)
│   └── [tenant]/
│       ├── page.tsx                  # Agent grid (/[tenant])
│       ├── connect/
│       │   └── page.tsx              # Data connector (/[tenant]/connect)
│       ├── agents/
│       │   └── [agentType]/
│       │       └── page.tsx          # Single agent detail (/[tenant]/agents/[agentType])
│       └── report/
│           └── page.tsx              # Unified report (/[tenant]/report)
├── components/
│   ├── AgentCard.tsx                 # Agent display card with controls
│   ├── TenantSwitcher.tsx            # Tenant dropdown switcher
│   ├── StatusBadge.tsx               # Status display badge
│   ├── ChannelUploadTab.tsx          # Channel-specific upload interface
│   ├── ReportSection.tsx             # Report section renderer
│   ├── SentimentScoreCard.tsx         # Sentiment analysis display
│   ├── OpportunityCard.tsx           # Content opportunity display
│   └── ui/
│       └── tabs.tsx                  # shadcn/ui Tabs component
└── package.json                      # Dependencies and scripts
```

---

## Pages Reference

### 1. Landing Page (`/`)

**Purpose:** Hero page to introduce ContentPulse and drive traffic to demo workspace.

**Features:**
- Full-screen gradient hero with value proposition
- 3 feature cards: Multi-Channel Analysis, AI Agents, Actionable Reports
- CTA button to demo workspace (`/devinsights`)
- Responsive design for all screen sizes

**Key Components:** None (custom layout)

**Mock Data:** None (static content)

---

### 2. Tenant Agent Grid (`/[tenant]`)

**Purpose:** Dashboard showing all AI agents for a tenant with orchestration controls.

**Features:**
- Grid layout (3 columns on desktop, 1 on mobile) of AgentCard components
- "Run All Enabled Agents" button for batch execution
- Agent status polling (checks every 2 seconds for updates)
- Toast notifications for agent run events
- Links to data connector and report pages

**Key Components:**
- `AgentCard` (x7)
- `TenantSwitcher`
- `StatusBadge` (within AgentCard)

**Mock Data:** `MOCK_AGENTS` array with 7 agents in various states

**API Integration Points:**
- `GET /api/[tenant]/agents` — fetch all agents
- `POST /api/[tenant]/agents/[agentType]/run` — trigger agent run
- `GET /api/[tenant]/agents/[agentType]/runs/latest` — poll for results
- `PATCH /api/[tenant]/agents/[agentType]/attributes/[key]` — toggle attribute

---

### 3. Data Connector (`/[tenant]/connect`)

**Purpose:** Upload and manage data sources across 6 channels.

**Features:**
- Tabbed interface (one tab per channel)
- Drag-and-drop file upload for each channel (CSV, XLSX)
- Template download buttons
- Upload progress tracking
- Import history display
- Channel-specific icons and branding

**Key Components:**
- `ChannelUploadTab` (x6, one per channel)
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (shadcn/ui)

**Supported Channels:**
- LinkedIn
- YouTube
- Blog
- Email Newsletter
- Reddit
- Google PPC

**Mock Data:** `channelStatus` object with mixed empty/loaded states

**API Integration Points:**
- `GET /api/[tenant]/connect/status` — fetch per-channel status
- `POST /api/[tenant]/upload` — upload file with FormData (file + channel)
- `GET /api/[tenant]/connect/[channel]/template` — download CSV template

---

### 4. Single Agent Detail (`/[tenant]/agents/[agentType]`)

**Purpose:** View and manage individual agent configuration and run history.

**Features:**
- Large agent header with icon, name, description
- Collapsible attributes list with individual toggles
- "Run Agent" button with loading state
- Table of last 10 runs with date, status, duration
- "View Result" links for completed runs
- Navigation back to agent grid

**Key Components:**
- `StatusBadge`
- Custom table layout

**Mock Data:**
- `AGENT_DETAILS` object (agent config)
- `MOCK_RUNS` array (run history)

**API Integration Points:**
- `GET /api/[tenant]/agents/[agentType]` — fetch agent config
- `PATCH /api/[tenant]/agents/[agentType]/attributes/[key]` — toggle attribute
- `POST /api/[tenant]/agents/[agentType]/run` — trigger run
- `GET /api/[tenant]/agents/[agentType]/runs` — fetch run history
- `GET /api/[tenant]/agents/[agentType]/runs/[runId]` — fetch run result

---

### 5. Unified Report (`/[tenant]/report`)

**Purpose:** Aggregated view of all completed agent analyses with export/share.

**Features:**
- Report metadata (generation date)
- Export PDF button (uses window.print())
- Share button (copies shareable link to clipboard)
- 5 report sections with conditional rendering:
  1. Sentiment Analysis (SentimentScoreCard)
  2. Recommended Opportunities (OpportunityCard grid)
  3. Audience Intelligence
  4. Channel & Content Performance Matrix
  5. Gap Analysis
  6. Competitor Analysis
- Collapsible sections (future enhancement)
- Footer with link to data connector

**Key Components:**
- `ReportSection`
- `SentimentScoreCard`
- `OpportunityCard` (x3+)

**Mock Data:** `MOCK_REPORT_DATA` object with complete agent outputs

**API Integration Points:**
- `GET /api/[tenant]/report` — fetch full report data
- `POST /api/[tenant]/report/export-pdf` — generate PDF (optional)
- `POST /api/[tenant]/report/share` — create shareable link

---

## Components Reference

### AgentCard

**Purpose:** Display single agent with status, controls, and attributes toggle.

**Props:**
```typescript
{
  agentType: string;                    // Unique agent identifier
  name: string;                         // Display name
  description: string;                  // Short description
  status: "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
  enabled: boolean;                     // Master toggle
  attributes: Array<{
    key: string;
    label: string;
    enabled: boolean;
  }>;
  lastRun: string | null;               // Human-readable time (e.g., "2 hours ago")
  resultPreview: string | null;         // One-liner result summary
  onToggle: () => void;                 // Master toggle callback
  onAttributeToggle: (key: string) => void;
  onRun: () => void;
}
```

**Features:**
- Icon mapped from `AGENT_ICONS`
- Master ON/OFF toggle switch
- Collapsible attributes section with individual checkboxes
- Disabled Run button when agent is disabled or already running
- Result preview in slate-800 box
- Last run timestamp footer

**Styling:**
- Status badge with colors (IDLE: gray, RUNNING: yellow pulse, COMPLETED: green, ERROR: red)
- Hover effects on attributes
- Responsive card layout

---

### TenantSwitcher

**Purpose:** Dropdown menu for switching between tenants.

**Props:**
```typescript
{
  tenants: Array<{ id: string; name: string; slug: string }>;
  currentSlug: string;
}
```

**Features:**
- Chevron icon rotates on open/close
- Highlights current tenant
- Navigate via Link to `/[slug]`
- Close dropdown on selection

---

### StatusBadge

**Purpose:** Display status with color coding and animations.

**Props:**
```typescript
{
  status: "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
}
```

**Features:**
- Color-coded background and text
- Animated pulse dot for RUNNING status
- Inline display (good for cards and tables)

---

### ChannelUploadTab

**Purpose:** File upload interface for a single channel.

**Props:**
```typescript
{
  channel: "LINKEDIN" | "YOUTUBE" | "BLOG" | "EMAIL_NEWSLETTER" | "REDDIT" | "GOOGLE_PPC";
  status: "empty" | "loaded";
  rowCount: number;
  lastImport: string | null;
  onFileUpload: (file: File) => void;
  onTemplateDownload: () => void;
}
```

**Features:**
- Drag-and-drop zone (dashed border, highlights on drag)
- Click to browse file input
- Accepts .csv and .xlsx files
- Download CSV template button
- Import history display (date + row count)
- Channel-specific icon and name in header

---

### ReportSection

**Purpose:** Render individual agent output section with conditional display.

**Props:**
```typescript
{
  agentType: string;
  title: string;
  data: any;
  status: string;
}
```

**Features:**
- Shows "Run [agent] to generate..." if data is empty or status != COMPLETED
- Renders data as JSON (pre-formatted) if object, or as text
- Uses `prose prose-invert` for readable text rendering

---

### SentimentScoreCard

**Purpose:** Display sentiment analysis with score and themes.

**Props:**
```typescript
{
  score: number;                    // 0-100
  label: string;
  positiveThemes: string[];
  negativeThemes: string[];
}
```

**Features:**
- Large score display with color: green (>60), yellow (40-60), red (<40)
- Two-column layout: positive themes (green pills) + negative themes (red pills)
- Card-based styling

---

### OpportunityCard

**Purpose:** Display content opportunity recommendation.

**Props:**
```typescript
{
  topic: string;
  format: string;
  channel: string;
  urgency: "HOT" | "WARM" | "EVERGREEN";
  reason: string;
  suggestedTitle: string;
}
```

**Features:**
- Urgency badge: 🔥 (red), 🌡️ (orange), 📌 (blue)
- Prominent suggested title
- Metadata tags (topic, format, channel) in slate-800 pills
- Reason explanation

---

### Tabs (shadcn/ui)

**Components:**
- `Tabs` — wrapper
- `TabsList` — container for triggers
- `TabsTrigger` — individual tab button
- `TabsContent` — content for each tab

**Used in:** Data Connector page for channel selection

---

## Styling System

### Design Tokens

**Colors:**
- `bg-slate-950` — Page background
- `bg-slate-900` — Card background
- `border-slate-800` — Borders
- `text-slate-400` — Body text
- `text-white` — Headings
- `bg-indigo-600` — Primary action buttons
- `text-indigo-400` — Links and accents

**Status Colors:**
- `IDLE`: `bg-slate-700 text-slate-300`
- `RUNNING`: `bg-yellow-500/20 text-yellow-400 animate-pulse`
- `COMPLETED`: `bg-green-500/20 text-green-400`
- `ERROR`: `bg-red-500/20 text-red-400`

### Utility Classes (globals.css)

```css
.container-page /* max-w-7xl mx-auto px-4 py-8 */
.card /* bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg */
.btn-primary /* px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium */
.btn-secondary /* px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-50 rounded-lg font-medium */
```

---

## Mock Data

All pages use mock data until backend APIs are ready. Mock data is defined within each page file:

- `MOCK_AGENTS` — Agent configurations and states
- `MOCK_TENANTS` — Tenant list
- `CHANNEL_STATUS` — Channel upload status
- `MOCK_RUNS` — Agent run history
- `MOCK_REPORT_DATA` — Complete report with all agent outputs

**To Switch to Real API:**
Replace mock data with `fetch()` calls:

```typescript
const data = await fetch(`/api/[tenant]/agents`).then(r => r.json());
```

---

## API Integration Checklist

### Agents Endpoint

- [ ] `GET /api/[tenant]/agents` — List all agents
- [ ] `POST /api/[tenant]/agents/[agentType]/run` — Trigger run
- [ ] `GET /api/[tenant]/agents/[agentType]/runs/latest` — Poll latest run
- [ ] `PATCH /api/[tenant]/agents/[agentType]/attributes/[key]` — Toggle attribute
- [ ] `GET /api/[tenant]/agents/[agentType]` — Fetch single agent config
- [ ] `GET /api/[tenant]/agents/[agentType]/runs` — Fetch run history

### Upload Endpoint

- [ ] `POST /api/[tenant]/upload` — Upload file (FormData)
- [ ] `GET /api/[tenant]/connect/status` — Channel status
- [ ] `GET /api/[tenant]/connect/[channel]/template` — Download template

### Report Endpoint

- [ ] `GET /api/[tenant]/report` — Fetch full report
- [ ] `POST /api/[tenant]/report/export-pdf` — Generate PDF (optional)

---

## Development Workflow

### Running the Frontend

```bash
npm install                  # Install dependencies
npm run dev                  # Start dev server (localhost:3000)
npm run build              # Production build
npm start                  # Start production server
```

### Key Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.3.0",
  "recharts": "^2.10.0",
  "lucide-react": "^0.263.0",
  "sonner": "^1.2.0",
  "@radix-ui/react-tabs": "^1.0.0"
}
```

---

## Best Practices

1. **Component Reusability:** All components accept props for flexibility.
2. **Mock Data Structure:** Uses TypeScript interfaces for type safety.
3. **Error Handling:** Toast notifications for all async operations.
4. **Loading States:** Skeleton cards use `animate-pulse` utility.
5. **Accessibility:** Uses semantic HTML and ARIA labels.
6. **Responsive Design:** Mobile-first approach with Tailwind breakpoints.

---

## Future Enhancements

- [ ] Collapsible report sections
- [ ] PDF generation (server-side)
- [ ] Shareable report links with access control
- [ ] Dark/light mode toggle
- [ ] Real-time WebSocket updates for agent runs
- [ ] Advanced filtering and search on report data
- [ ] Custom agent creation UI
- [ ] Team collaboration features

---

## Contact & Support

**Frontend Author:** sanat.k.mahapatra

For questions or updates, refer to this documentation or contact the development team.

---

Generated: 2024-12-18
Last Updated: 2024-12-18
