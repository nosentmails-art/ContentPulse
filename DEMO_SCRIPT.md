# Demo Script — Hackathon Presentation

> Practice this flow before presenting. Total demo time: 4-5 minutes.

---

## Setup Before Demo

- [ ] `npm run dev` running on localhost:3000
- [ ] Browser open on landing page
- [ ] LinkedIn CSV file ready on desktop (5-10 rows)
- [ ] Blog CSV file ready on desktop (5-10 rows)
- [ ] No console errors open
- [ ] Demo data seeded (devinsights + growthstack tenants)

---

## The Pitch (30 seconds)

> "Content teams publish every day across 6+ channels but plan next month 
> based on gut feel. ContentPulse is an AI agent platform that analyzes 
> your cross-channel content performance and tells you exactly what to 
> write, refresh, and kill — per channel, per audience, per format."

---

## Demo Flow

### Step 1 — Landing Page (20 sec)
- Show hero headline
- Point to 3 feature cards: Multi-Channel, AI Agents, Actionable Reports
- Click "View Demo" → goes to /devinsights

---

### Step 2 — Agent Grid (45 sec)
- Show 7 agent cards in the grid
- Point out: "Each client has their own set of agents"
- Show status badges: some COMPLETED (green), some IDLE (gray)
- **Key message**: "Agents are modular — each can be turned on/off"
- Click one agent's toggle OFF → show it grays out instantly
- Toggle it back ON
- Expand an agent's attributes → show individual toggles
- **Key message**: "Granular control — even within each agent"

---

### Step 3 — Tenant Switch (20 sec)
- Click TenantSwitcher dropdown at top
- Switch to "GrowthStack Weekly"
- Show different agents, different data, different configuration
- **Key message**: "Multi-tenant — each client is completely isolated"
- Switch back to DevInsights

---

### Step 4 — Connect Data (40 sec)
- Navigate to /devinsights/connect
- Show tabs for each channel
- Click LinkedIn tab → show upload zone
- Drag and drop LinkedIn CSV file
- Show rows imported successfully
- **Key message**: "CSV upload today, live API connection tomorrow — 
  the connector is already architected to plug in"
- Show "Connect via API → Coming Soon" button

---

### Step 5 — Run an Agent (60 sec)
- Go back to /devinsights agent grid
- Click "Run" on Content Analytics Agent
- Watch: IDLE → RUNNING (pulsing yellow ring)
- Sub-agents auto-trigger: Audience Intelligence, Channel Intelligence, Sentiment
- Watch them complete one by one
- Cards update with result previews
- **Key message**: "Agents chain together — one trigger, coordinated intelligence"

---

### Step 6 — Intelligence Report (60 sec)
- Navigate to /devinsights/report
- Scroll through sections:

  1. **Audience Intelligence** → "3 distinct segments identified"
     Point to segments table, highlight top insight

  2. **Channel Intelligence** → Show format × channel matrix
     "LinkedIn works best for listicles. YouTube for tutorials. Blog for guides."

  3. **Sentiment Analysis** → Show score (e.g. 74/100 Positive)
     Show positive themes (green) vs negative themes (red)
     **This is the visual wow moment**

  4. **Opportunities** → Show opportunity cards
     Each with urgency badge (HOT / WARM / EVERGREEN)
     Point to suggested title: "This is your next piece of content"

---

### Step 7 — The Closer (30 sec)

> "We built this in 24 hours. Today it's CSV upload — connect your 
> LinkedIn export and get intelligence in 30 seconds. Tomorrow, 
> live API sync. The agent architecture is already built to support it.
> Any content team, any channel, any scale."

Show export PDF button. Done.

---

## Likely Judge Questions & Answers

**Q: How is this different from Google Analytics?**
A: GA gives you raw numbers. ContentPulse tells you what to DO with those numbers — cross-channel, AI-analyzed, in plain language.

**Q: What AI model are you using?**
A: CodeBenders built-in LLM for analysis. The agent prompts are engineered per agent type for specific structured outputs.

**Q: How would real API connections work?**
A: Each channel has a connector class. For CSV we implemented parse(). For API we add a connect() method. Same interface, swappable implementation. LinkedIn Marketing API, YouTube Data API v3 — all documented in CONNECTOR_MATRIX.md.

**Q: How does multi-tenancy work?**
A: Every DB query is scoped to tenantId. Agents, content items, runs — all isolated. Switching tenants changes everything shown.

**Q: Can you add more agents?**
A: Yes — add an AgentType enum value, create the analyzer in /lib/agents/, seed the attributes. The UI renders dynamically.
