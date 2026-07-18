/**
 * CONTENTPULSE QUICK START GUIDE
 * @author sanat.k.mahapatra
 * 
 * Get the frontend running locally in 5 minutes
 */

# ContentPulse Quick Start Guide

## For Frontend Developers

This is the **frontend codebase** for ContentPulse. All pages and components are complete and ready for API integration.

---

## Setup (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/nosentmails-art/ContentPulse.git
cd ContentPulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Dev Server

```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

---

## Project Structure

```
app/
  ├── page.tsx                           # Landing page (/)
  ├── [tenant]/
  │   ├── page.tsx                       # Agent dashboard
  │   ├── connect/page.tsx               # Data upload
  │   ├── agents/[agentType]/page.tsx   # Agent detail
  │   └── report/page.tsx                # Unified report
  └── layout.tsx                         # Root layout

components/
  ├── AgentCard.tsx                      # Agent display
  ├── TenantSwitcher.tsx                 # Tenant dropdown
  ├── StatusBadge.tsx                    # Status indicator
  ├── ChannelUploadTab.tsx               # Upload interface
  ├── ReportSection.tsx                  # Report renderer
  ├── SentimentScoreCard.tsx             # Sentiment display
  ├── OpportunityCard.tsx                # Opportunity display
  └── ui/tabs.tsx                        # Tabs component
```

---

## Pages Checklist

✅ All pages built and working with mock data:

- ✅ `/` — Landing page
- ✅ `/[tenant]` — Agent grid dashboard
- ✅ `/[tenant]/connect` — Data connector with multi-channel tabs
- ✅ `/[tenant]/agents/[agentType]` — Single agent detail + run history
- ✅ `/[tenant]/report` — Unified report with all agent outputs

---

## What to Do

### For Frontend Tasks:

1. **Add real API calls** — Replace mock data with fetch() calls to backend endpoints
   - See `API_INTEGRATION_CHECKLIST` in `FRONTEND_DOCUMENTATION.md`
   
2. **Polish UI** — Add loading states, error boundaries, animations
   - Skeleton cards already use `animate-pulse`
   - Toast notifications ready via Sonner
   
3. **Testing** — Add unit tests and E2E tests
   - Use Jest + React Testing Library for components
   - Use Playwright for E2E
   
4. **Responsive refinement** — Test on mobile/tablet
   - TailwindCSS breakpoints already used
   - May need minor adjustments

### For Backend Team:

The frontend is **ready for API integration**. All fetch endpoints are listed in:
- `/FRONTEND_DOCUMENTATION.md` → API Integration Points section
- `/COMPONENT_API_REFERENCE.md` → Each component documents its endpoints

---

## Key Branches

```
main
  └── Your feature branch: frontend-[feature-name]
        └── Make changes
        └── Push to GitHub
        └── Create PR when ready
```

**Do NOT commit directly to main.** Create feature branches and make PRs.

---

## Documentation Files

📖 **Read these first:**

1. `FRONTEND_DOCUMENTATION.md` — Complete architecture guide
2. `COMPONENT_API_REFERENCE.md` — Detailed component props
3. `README.md` — Project overview (GitHub)

---

## Available Scripts

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + custom utilities
- **Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Charts:** Recharts (prepared for backend data)
- **Notifications:** Sonner (toast system)

---

## Mock Data Structure

All pages use realistic mock data:

**Agents:** 7 agents in various states (IDLE, RUNNING, COMPLETED, ERROR)
**Tenants:** 3 demo tenants
**Channels:** 6 data channels with upload status
**Reports:** Complete mock report data with all agent outputs

To replace with real data:
1. Update fetch URLs to match backend API
2. Keep same data shape/interfaces
3. Add error handling

---

## Quick API Integration Example

### Before (Mock)

```typescript
const [agents, setAgents] = useState(MOCK_AGENTS);
```

### After (Real API)

```typescript
const [agents, setAgents] = useState([]);

useEffect(() => {
  const fetchAgents = async () => {
    const res = await fetch(`/api/${tenantSlug}/agents`);
    const data = await res.json();
    setAgents(data);
  };
  fetchAgents();
}, [tenantSlug]);
```

---

## Troubleshooting

**Issue:** Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9    # Kill existing process
npm run dev
```

**Issue:** Module not found
```bash
npm install                        # Reinstall dependencies
rm -rf .next                       # Clear Next.js cache
npm run dev
```

**Issue:** Styling looks broken
```bash
npm run build                      # Rebuild Tailwind
npm run dev
```

---

## Next Steps

1. ✅ Clone repo and run locally
2. ✅ Explore pages and components
3. ✅ Read documentation files
4. ✅ Create feature branch for your work
5. ⏳ Wait for backend API endpoints
6. ⏳ Integrate real data
7. ⏳ Deploy to staging/production

---

## Questions?

Refer to the documentation files:
- **Architecture?** → `FRONTEND_DOCUMENTATION.md`
- **Component usage?** → `COMPONENT_API_REFERENCE.md`
- **Project status?** → `README.md`

---

**Happy coding!** 🚀

---

**Guide Version:** 1.0
**Last Updated:** 2024-12-18
**Author:** sanat.k.mahapatra
