/**
 * COMPONENT API REFERENCE
 * @author sanat.k.mahapatra
 * 
 * Detailed API documentation for all ContentPulse frontend components
 */

# ContentPulse Component API Reference

## Table of Contents

1. [AgentCard](#agentcard)
2. [TenantSwitcher](#tenantswitcher)
3. [StatusBadge](#statusbadge)
4. [ChannelUploadTab](#channeluploadt ab)
5. [ReportSection](#reportsection)
6. [SentimentScoreCard](#sentimentscorecard)
7. [OpportunityCard](#opportunitycard)
8. [Tabs (shadcn/ui)](#tabs-radix-ui)

---

## AgentCard

**Location:** `/components/AgentCard.tsx`

**Purpose:** Display and control individual AI agents with status, attributes, and run controls.

### Usage

```typescript
import { AgentCard } from "@/components/AgentCard";

<AgentCard
  agentType="CONTENT_ANALYTICS"
  name="Content Analytics"
  description="Ingests and normalizes all channel data"
  status="COMPLETED"
  enabled={true}
  attributes={[
    { key: "linkedin", label: "Pull LinkedIn data", enabled: true },
    { key: "youtube", label: "Pull YouTube data", enabled: true },
  ]}
  lastRun="2 hours ago"
  resultPreview="127 content items analyzed"
  onToggle={() => setEnabled(!enabled)}
  onAttributeToggle={(key) => toggleAttr(key)}
  onRun={() => runAgent()}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `agentType` | string | ✅ | Unique agent identifier (maps to AGENT_ICONS) |
| `name` | string | ✅ | Display name |
| `description` | string | ✅ | Short agent description |
| `status` | "IDLE" \| "RUNNING" \| "COMPLETED" \| "ERROR" | ✅ | Current status |
| `enabled` | boolean | ✅ | Master toggle state |
| `attributes` | Attribute[] | ✅ | List of toggleable attributes |
| `lastRun` | string \| null | ✅ | Human-readable time (e.g., "2 hours ago") or null |
| `resultPreview` | string \| null | ✅ | One-liner result summary or null |
| `onToggle` | () => void | ✅ | Master toggle callback |
| `onAttributeToggle` | (key: string) => void | ✅ | Attribute toggle callback |
| `onRun` | () => void | ✅ | Run button callback |

### Attribute Type

```typescript
interface Attribute {
  key: string;      // Unique identifier
  label: string;    // Display label
  enabled: boolean; // Current toggle state
}
```

### Supported Agent Types

```
CONTENT_ANALYTICS
AUDIENCE_INTELLIGENCE
CHANNEL_CONTENT_INTELLIGENCE
SENTIMENT_ANALYSIS
GAP_ANALYSIS
COMPETITOR_ANALYSIS
OPPORTUNITY_IDENTIFICATION
```

Each has a corresponding Lucide React icon in `AGENT_ICONS`.

### Features

- ✅ Icon display from AGENT_ICONS map
- ✅ Master ON/OFF toggle (top right)
- ✅ Status badge with animations
- ✅ Collapsible attributes section
- ✅ Result preview in slate-800 box
- ✅ Run button (disabled when !enabled or status=RUNNING)
- ✅ Last run timestamp

---

## TenantSwitcher

**Location:** `/components/TenantSwitcher.tsx`

**Purpose:** Dropdown menu for switching between tenants in multi-tenant setup.

### Usage

```typescript
import { TenantSwitcher } from "@/components/TenantSwitcher";

<TenantSwitcher
  tenants={[
    { id: "1", name: "DevInsights", slug: "devinsights" },
    { id: "2", name: "MarketingHub", slug: "marketinghub" },
  ]}
  currentSlug="devinsights"
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tenants` | Tenant[] | ✅ | List of available tenants |
| `currentSlug` | string | ✅ | Current tenant slug (highlights in dropdown) |

### Tenant Type

```typescript
interface Tenant {
  id: string;       // Unique identifier
  name: string;     // Display name
  slug: string;     // URL slug for navigation
}
```

### Features

- ✅ Dropdown toggle on click
- ✅ Highlights current tenant
- ✅ Navigate via Next.js Link to `/{slug}`
- ✅ Closes dropdown on selection
- ✅ Chevron icon rotates when open

---

## StatusBadge

**Location:** `/components/StatusBadge.tsx`

**Purpose:** Display agent/run status with color coding and optional animation.

### Usage

```typescript
import { StatusBadge } from "@/components/StatusBadge";

<StatusBadge status="RUNNING" />
<StatusBadge status="COMPLETED" />
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | "IDLE" \| "RUNNING" \| "COMPLETED" \| "ERROR" | ✅ | Status value |

### Status Styling

| Status | Background | Text | Animation |
|--------|-----------|------|-----------|
| IDLE | `bg-slate-700` | `text-slate-300` | None |
| RUNNING | `bg-yellow-500/20` | `text-yellow-400` | Pulse dot |
| COMPLETED | `bg-green-500/20` | `text-green-400` | None |
| ERROR | `bg-red-500/20` | `text-red-400` | None |

### Features

- ✅ Inline pill-shaped badge
- ✅ Animated pulse dot for RUNNING status
- ✅ Responsive text sizing

---

## ChannelUploadTab

**Location:** `/components/ChannelUploadTab.tsx`

**Purpose:** File upload interface for a specific data channel.

### Usage

```typescript
import { ChannelUploadTab } from "@/components/ChannelUploadTab";

<ChannelUploadTab
  channel="LINKEDIN"
  status="loaded"
  rowCount={42}
  lastImport="2 days ago"
  onFileUpload={(file) => uploadFile(file)}
  onTemplateDownload={() => downloadTemplate()}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `channel` | Channel enum | ✅ | Channel type |
| `status` | "empty" \| "loaded" | ✅ | Upload status |
| `rowCount` | number | ✅ | Rows imported (0 if empty) |
| `lastImport` | string \| null | ✅ | Last import date (e.g., "2 days ago") |
| `onFileUpload` | (file: File) => void | ✅ | File select callback |
| `onTemplateDownload` | () => void | ✅ | Template download callback |

### Supported Channels

```
LINKEDIN
YOUTUBE
BLOG
EMAIL_NEWSLETTER
REDDIT
GOOGLE_PPC
```

### Features

- ✅ Drag-and-drop zone (dashed border, highlights on drag)
- ✅ Click to browse file selector
- ✅ Accepts .csv and .xlsx files
- ✅ Download CSV template button
- ✅ Import history display
- ✅ Channel-specific icon and name
- ✅ Status badge

---

## ReportSection

**Location:** `/components/ReportSection.tsx`

**Purpose:** Render individual agent output in report with conditional display.

### Usage

```typescript
import { ReportSection } from "@/components/ReportSection";

<ReportSection
  agentType="AUDIENCE_INTELLIGENCE"
  title="Audience Intelligence"
  data={{
    segments: [...],
    topInsight: "...",
  }}
  status="COMPLETED"
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `agentType` | string | ✅ | Agent type identifier |
| `title` | string | ✅ | Section display title |
| `data` | any | ✅ | Report data (object or string) |
| `status` | string | ✅ | Agent run status |

### Features

- ✅ Conditional rendering: shows "Run [agent]..." if no data
- ✅ JSON rendering for object data (pre-formatted)
- ✅ Text rendering for string data
- ✅ Prose styling for readable output

---

## SentimentScoreCard

**Location:** `/components/SentimentScoreCard.tsx`

**Purpose:** Display sentiment analysis score with positive/negative themes.

### Usage

```typescript
import { SentimentScoreCard } from "@/components/SentimentScoreCard";

<SentimentScoreCard
  score={72}
  label="Overall Sentiment Score"
  positiveThemes={["Helpful", "Informative", "Well-structured"]}
  negativeThemes={["Too technical", "Slow delivery"]}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `score` | number | ✅ | Sentiment score (0-100) |
| `label` | string | ✅ | Display label |
| `positiveThemes` | string[] | ✅ | List of positive themes |
| `negativeThemes` | string[] | ✅ | List of negative themes |

### Score Color Mapping

| Score Range | Color |
|------------|-------|
| 61-100 | Green (`text-green-400`) |
| 40-60 | Yellow (`text-yellow-400`) |
| 0-39 | Red (`text-red-400`) |

### Features

- ✅ Large score display with dynamic color
- ✅ Two-column layout (positive/negative)
- ✅ Pill-shaped theme badges
- ✅ Color-coded columns

---

## OpportunityCard

**Location:** `/components/OpportunityCard.tsx`

**Purpose:** Display content opportunity recommendation with urgency indicator.

### Usage

```typescript
import { OpportunityCard } from "@/components/OpportunityCard";

<OpportunityCard
  topic="LLM Fine-tuning"
  format="Tutorial"
  channel="YouTube"
  urgency="HOT"
  reason="High search volume, low competition"
  suggestedTitle="Complete Guide to Fine-tuning Large Language Models"
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `topic` | string | ✅ | Content topic |
| `format` | string | ✅ | Content format (e.g., "Tutorial") |
| `channel` | string | ✅ | Target channel |
| `urgency` | "HOT" \| "WARM" \| "EVERGREEN" | ✅ | Urgency level |
| `reason` | string | ✅ | Why this opportunity |
| `suggestedTitle` | string | ✅ | Recommended article title |

### Urgency Badge Styles

| Urgency | Emoji | Background | Text |
|---------|-------|-----------|------|
| HOT | 🔥 | `bg-red-500/20` | `text-red-400` |
| WARM | 🌡️ | `bg-orange-500/20` | `text-orange-400` |
| EVERGREEN | 📌 | `bg-blue-500/20` | `text-blue-400` |

### Features

- ✅ Prominent title display
- ✅ Urgency badge with emoji
- ✅ Reason explanation
- ✅ Metadata tags (topic, format, channel)
- ✅ Card-based layout

---

## Tabs (Radix UI)

**Location:** `/components/ui/tabs.tsx`

**Purpose:** Accessible tabbed interface (shadcn/ui Tabs from @radix-ui/react-tabs).

### Usage

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Components

| Component | Purpose |
|-----------|---------|
| `Tabs` | Root wrapper (sets default value) |
| `TabsList` | Container for triggers |
| `TabsTrigger` | Individual tab button |
| `TabsContent` | Content panel for each tab |

### Props

**Tabs:**
- `defaultValue` — Initial tab value
- `children` — TabsList and TabsContent elements

**TabsList:**
- `className` — Additional styling
- `children` — TabsTrigger elements

**TabsTrigger:**
- `value` — Unique identifier
- `children` — Button text
- `className` — Additional styling

**TabsContent:**
- `value` — Must match TabsTrigger value
- `children` — Content to display
- `className` — Additional styling

### Features

- ✅ Keyboard navigation (arrow keys)
- ✅ ARIA labels for accessibility
- ✅ Radix UI primitives
- ✅ TailwindCSS styling

---

## Global Utilities

**File:** `/app/globals.css`

### Utility Classes

```css
.container-page
  max-width: 80rem (1280px)
  horizontal padding: responsive (1rem to 2rem)
  vertical padding: 2rem (top/bottom)

.card
  background: slate-900
  border: 1px solid slate-800
  border-radius: 0.75rem (12px)
  padding: 1.5rem (24px)
  box-shadow: lg

.btn-primary
  background: indigo-600
  hover: indigo-700
  color: white
  padding: 0.5rem 1rem
  border-radius: 0.5rem
  font-weight: 500
  transition: all colors

.btn-secondary
  background: slate-800
  hover: slate-700
  color: slate-50
  padding: 0.5rem 1rem
  border-radius: 0.5rem
  font-weight: 500
```

---

## TypeScript Interfaces

### Attribute

```typescript
interface Attribute {
  key: string;
  label: string;
  enabled: boolean;
}
```

### Tenant

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;
}
```

### Channel Type

```typescript
type Channel = 
  | "LINKEDIN"
  | "YOUTUBE"
  | "BLOG"
  | "EMAIL_NEWSLETTER"
  | "REDDIT"
  | "GOOGLE_PPC";
```

### Agent Status

```typescript
type AgentStatus = "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
```

---

## Best Practices

1. **Props Validation:** All components use TypeScript for type safety.
2. **Callbacks:** Asynchronous operations should emit toast notifications.
3. **Accessibility:** Use semantic HTML and ARIA attributes.
4. **Responsive Design:** Mobile-first approach with Tailwind breakpoints.
5. **Error Handling:** Graceful fallbacks for missing data.

---

**Document Version:** 1.0
**Last Updated:** 2024-12-18
**Author:** sanat.k.mahapatra
