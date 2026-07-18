# Team Split — File Ownership

## Golden Rule
**Person A never creates files in `/api/` or `/lib/` or `/prisma/`**
**Person B never creates files in `/app/[page]/` or `/components/`**

---

## Person A — Frontend/UI

### Owns These Folders
```
/app/[tenant]/page.tsx
/app/[tenant]/connect/page.tsx
/app/[tenant]/agents/page.tsx
/app/[tenant]/agents/[agentType]/page.tsx
/app/[tenant]/report/page.tsx
/app/page.tsx              (landing)
/app/layout.tsx
/app/globals.css
/components/               (ALL files)
```

### Does NOT Touch
```
/app/api/       ← backend only
/lib/           ← backend only
/prisma/        ← backend only
```

### Branch
`feature/frontend-ui`

### How to work with API before backend is ready
Use the mock data defined in your CodeBenders prompt.
Replace mock with real `fetch()` calls once backend merges to main.

---

## Person B — Backend/API

### Owns These Folders
```
/app/api/                  (ALL routes)
/lib/agents/               (ALL agent analyzers)
/lib/connectors/           (ALL channel parsers)
/lib/templates.ts
/lib/db.ts
/prisma/schema.prisma
/prisma/seed.ts
```

### Does NOT Touch
```
/app/[tenant]/    ← frontend only
/components/      ← frontend only
```

### Branch
`feature/backend-api`

---

## Shared Files (coordinate before editing)

| File | Who edits | Rule |
|------|-----------|------|
| `package.json` | Both | Tell each other before adding packages |
| `tailwind.config.ts` | Person A primarily | Notify B if changing |
| `tsconfig.json` | Either | Notify other before changing |
| `.env.example` | Person B | Keep updated with all required vars |
| `next.config.js` | Person B | API/server config changes |

---

## Merge Order

```
Step 1: Person B finishes → merges feature/backend-api → main
Step 2: Person A pulls main → connects UI to real APIs
Step 3: Person A merges feature/frontend-ui → main
Step 4: Both test together → fix any integration issues
Step 5: Demo ready
```

---

## API Contract (frontend calls these, backend builds these)

Person A's fetch calls must match exactly:

| Method | Route | Called from |
|--------|-------|-------------|
| GET | /api/tenants | TenantSwitcher |
| GET | /api/[tenant]/agents | Agent grid page |
| PATCH | /api/[tenant]/agents/[agentType] | Agent master toggle |
| PATCH | /api/[tenant]/agents/[agentType]/attributes/[key] | Attribute toggle |
| POST | /api/[tenant]/agents/[agentType]/run | Run button |
| GET | /api/[tenant]/agents/[agentType]/runs/latest | Status polling |
| POST | /api/[tenant]/upload | File upload |
| GET | /api/[tenant]/connect/status | Connector status |
| GET | /api/[tenant]/connect/template/[channel] | Template download |
| GET | /api/[tenant]/report | Report page |
| POST | /api/[tenant]/competitors | Add competitor |

**Person B: build all these routes exactly as listed above.**
**Person A: call all these routes exactly as listed above.**
