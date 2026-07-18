# ContentPulse API Routes Summary

Complete documentation of all 9 backend API endpoints for the ContentPulse multi-tenant content intelligence platform.

---

## Overview

All routes follow the pattern:
- **Base URL**: `http://localhost:3000/api`
- **Tenant ID**: Dynamic path parameter extracted from URL
- **Error Handling**: All routes return `{ error: string }` on failure with appropriate HTTP status codes
- **Database**: Prisma ORM with SQLite

---

## Routes by Category

### 1. Tenant Management (1 route)

#### GET /api/tenants
**Purpose**: List all tenants for the tenant switcher
**Method**: GET
**Authentication**: None required
**Path Parameters**: None

**Response (200 OK)**:
```json
{
  "tenants": [
    {
      "id": "clx123...",
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    {
      "id": "clx456...",
      "name": "TechStart Inc",
      "slug": "techstart"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/tenants
```

---

### 2. Agent Management (4 routes)

#### GET /api/[tenant]/agents
**Purpose**: Retrieve all agents for a tenant with their attributes and latest run status
**Method**: GET
**Path Parameters**: 
- `tenant` (string): Tenant ID

**Response (200 OK)**:
```json
{
  "agents": [
    {
      "id": "clx789...",
      "tenantId": "clx123...",
      "type": "AUDIENCE_INTELLIGENCE",
      "name": "Audience Intelligence Agent",
      "description": "Analyzes audience demographics and behavior",
      "enabled": true,
      "status": "IDLE",
      "lastRun": "2024-01-15T10:30:00Z",
      "attributes": [
        {
          "id": "clx999...",
          "agentId": "clx789...",
          "key": "age_distribution",
          "label": "Age Distribution",
          "enabled": true
        }
      ],
      "latestRun": {
        "id": "clxabc...",
        "status": "COMPLETED",
        "startedAt": "2024-01-15T10:30:00Z",
        "completedAt": "2024-01-15T10:35:00Z"
      }
    }
  ]
}
```

**Error (404)**:
```json
{ "error": "Tenant not found" }
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/[tenant]/agents \
  -H "Content-Type: application/json"
```

---

#### PATCH /api/[tenant]/agents/[agentType]
**Purpose**: Toggle agent enabled/disabled status
**Method**: PATCH
**Path Parameters**:
- `tenant` (string): Tenant ID
- `agentType` (string): Agent type (AUDIENCE_INTELLIGENCE, CHANNEL_CONTENT_INTELLIGENCE, SENTIMENT_ANALYSIS, COMPETITOR_ANALYSIS, OPPORTUNITY_IDENTIFICATION, CONTENT_ANALYTICS)

**Request Body**:
```json
{
  "enabled": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "agent": {
    "id": "clx789...",
    "tenantId": "clx123...",
    "type": "AUDIENCE_INTELLIGENCE",
    "name": "Audience Intelligence Agent",
    "enabled": true,
    "status": "IDLE"
  }
}
```

**Error (400)**: `{ "error": "enabled must be a boolean" }`
**Error (404)**: `{ "error": "Tenant not found" }` or `{ "error": "Agent not found" }`

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/api/[tenant]/agents/AUDIENCE_INTELLIGENCE \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

#### PATCH /api/[tenant]/agents/[agentType]/attributes/[key]
**Purpose**: Toggle individual agent attribute enabled/disabled status
**Method**: PATCH
**Path Parameters**:
- `tenant` (string): Tenant ID
- `agentType` (string): Agent type
- `key` (string): Attribute key (e.g., "age_distribution", "sentiment_score")

**Request Body**:
```json
{
  "enabled": false
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "attribute": {
    "id": "clx999...",
    "agentId": "clx789...",
    "key": "age_distribution",
    "label": "Age Distribution",
    "enabled": false
  }
}
```

**Error (400)**: `{ "error": "enabled must be a boolean" }`
**Error (404)**: `{ "error": "Tenant not found" }`, `{ "error": "Agent not found" }`, or `{ "error": "Attribute not found" }`

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/api/[tenant]/agents/SENTIMENT_ANALYSIS/attributes/sentiment_score \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

---

#### POST /api/[tenant]/agents/[agentType]/run
**Purpose**: Execute an agent analysis and create an AgentRun record
**Method**: POST
**Path Parameters**:
- `tenant` (string): Tenant ID
- `agentType` (string): Agent type

**Request Body**: None (empty)

**Response (200 OK)**:
```json
{
  "runId": "clxdef...",
  "status": "COMPLETED",
  "result": {
    "summary": "Analysis of audience demographics across channels",
    "data": {
      "totalAudience": 15000,
      "primaryAgeGroup": "25-34",
      "topChannel": "LINKEDIN"
    }
  }
}
```

**Response (500 - Agent Error)**:
```json
{
  "runId": "clxdef...",
  "status": "ERROR",
  "error": "Insufficient data to analyze"
}
```

**Error (400)**:
- `{ "error": "Tenant not found" }`
- `{ "error": "Agent not found" }`
- `{ "error": "Agent is disabled" }`

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/[tenant]/agents/CHANNEL_CONTENT_INTELLIGENCE/run \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Agent Types & LLM Calls**:
- `AUDIENCE_INTELLIGENCE`: Calls `analyzeAudienceIntelligence()`
- `CHANNEL_CONTENT_INTELLIGENCE`: Calls `analyzeChannelIntelligence()`
- `SENTIMENT_ANALYSIS`: Calls `analyzeSentiment()`
- `COMPETITOR_ANALYSIS`: Calls `analyzeCompetitors()`
- `OPPORTUNITY_IDENTIFICATION`: Calls `identifyOpportunities()`
- `CONTENT_ANALYTICS`: Returns mock data (no LLM call)

---

#### GET /api/[tenant]/agents/[agentType]/runs/latest
**Purpose**: Retrieve the most recent AgentRun for an agent
**Method**: GET
**Path Parameters**:
- `tenant` (string): Tenant ID
- `agentType` (string): Agent type

**Response (200 OK)**:
```json
{
  "run": {
    "id": "clxdef...",
    "agentId": "clx789...",
    "status": "COMPLETED",
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:35:00Z",
    "logs": null,
    "resultJson": "{\"summary\": \"...\", \"data\": {...}}"
  }
}
```

**Response (200 OK - No runs)**:
```json
{
  "run": null
}
```

**Error (404)**:
- `{ "error": "Tenant not found" }`
- `{ "error": "Agent not found" }`

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/[tenant]/agents/AUDIENCE_INTELLIGENCE/runs/latest \
  -H "Content-Type: application/json"
```

---

### 3. File Import & Channel Connection (3 routes)

#### POST /api/[tenant]/upload
**Purpose**: Upload CSV/Excel file and import content with automatic deduplication
**Method**: POST
**Path Parameters**:
- `tenant` (string): Tenant ID

**Request Body** (FormData):
- `file` (File): CSV or Excel file
- `channel` (string): Channel type (LINKEDIN, YOUTUBE, BLOG, EMAIL_NEWSLETTER, REDDIT, GOOGLE_PPC)

**Response (200 OK)**:
```json
{
  "success": true,
  "rowsImported": 47,
  "errors": [
    "Row 5: Invalid email format",
    "Row 12: Missing required field 'title'"
  ],
  "preview": [
    {
      "title": "Best practices for social media marketing",
      "impressions": 2500,
      "reach": 1200,
      "likes": 145,
      "post_date": "2024-01-10"
    },
    {
      "title": "Q1 engagement trends",
      "impressions": 3200,
      "reach": 1800
    }
  ]
}
```

**Deduplication Logic**:
1. If URL exists in row → upsert by (tenantId, channel, url)
2. Else if publishDate exists → try to find by (tenantId, channel, publishDate)
3. Otherwise → create as new entry
4. Always upsert ChannelMetrics (create if missing, update if exists)

**Parsed Channel Fields** (examples):
- **LinkedIn**: post_date, post_text, impressions, reach, likes, comments, shares
- **YouTube**: video_url, views, watch_time, avg_view_duration, subscribers_gained
- **Blog**: article_url, publish_date, word_count, sessions, bounce_rate
- **Email**: open_rate, unsubscribes, leads_generated
- **Reddit**: post_url, upvotes, comments, mention_frequency
- **Google PPC**: impressions, clicks, conversions, cpc, cost_per_conversion

**Error (400)**:
- `{ "error": "Missing file or channel parameter" }`
- `{ "error": "Unknown channel: INVALID_CHANNEL" }`
- `{ "error": "Parse error message" }`

**Error (404)**:
- `{ "error": "Tenant not found" }`

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/[tenant]/upload \
  -F "file=@campaigns.csv" \
  -F "channel=LINKEDIN"
```

---

#### GET /api/[tenant]/connect/status
**Purpose**: Retrieve import status for each channel
**Method**: GET
**Path Parameters**:
- `tenant` (string): Tenant ID

**Response (200 OK)**:
```json
{
  "channels": [
    {
      "channel": "LINKEDIN",
      "rowCount": 47,
      "lastImport": "2024-01-15T10:30:00Z"
    },
    {
      "channel": "YOUTUBE",
      "rowCount": 12,
      "lastImport": "2024-01-14T15:20:00Z"
    },
    {
      "channel": "BLOG",
      "rowCount": 0,
      "lastImport": null
    }
  ]
}
```

**Error (404)**:
- `{ "error": "Tenant not found" }`

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/[tenant]/connect/status \
  -H "Content-Type: application/json"
```

---

#### GET /api/[tenant]/connect/template/[channel]
**Purpose**: Download CSV template for a specific channel
**Method**: GET
**Path Parameters**:
- `tenant` (string): Tenant ID
- `channel` (string): Channel type

**Response (200 OK)**: CSV file download
```
post_date,post_text,post_type,impressions,reach,likes,comments,shares,ctr,follower_growth,hashtags
2024-01-10,Sample post text,ARTICLE,1000,500,50,10,5,0.05,10,#marketing
```

**Headers**:
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="template_linkedin.csv"`

**Error (400)**:
- `{ "error": "Invalid channel" }`

**Error (404)**:
- `{ "error": "Tenant not found" }`

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/[tenant]/connect/template/LINKEDIN \
  -o template.csv
```

---

## Database Schema Reference

### Key Entities

**ContentItem**: Represents imported content
- `id`, `tenantId`, `channel`, `url`, `title`, `publishDate`, `rawData` (JSON), `createdAt`, `updatedAt`

**ChannelMetrics**: Performance metrics linked to ContentItem
- `contentItemId` (unique), `impressions`, `reach`, `clicks`, `likes`, `comments`, `views`, `conversions`, etc.

**Agent**: Analysis agent
- `id`, `tenantId`, `type` (unique per tenant), `enabled`, `status`, `lastRun`

**AgentAttribute**: Configurable parameters for agents
- `id`, `agentId`, `key`, `label`, `enabled`

**AgentRun**: Execution record
- `id`, `agentId`, `status` (RUNNING, COMPLETED, ERROR), `startedAt`, `completedAt`, `resultJson`, `logs`

---

## Error Codes Reference

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 404 | Resource not found |
| 500 | Server error |

---

## Testing Checklist

- [ ] POST /api/[tenant]/upload with CSV file
- [ ] GET /api/[tenant]/agents returns all 6 agent types
- [ ] PATCH /api/[tenant]/agents/[agentType] toggles enabled
- [ ] PATCH /api/[tenant]/agents/[agentType]/attributes/[key] toggles attribute
- [ ] POST /api/[tenant]/agents/[agentType]/run executes LLM analysis
- [ ] GET /api/[tenant]/agents/[agentType]/runs/latest returns recent run
- [ ] GET /api/[tenant]/connect/status shows channel import counts
- [ ] GET /api/[tenant]/connect/template/[channel] downloads CSV
- [ ] GET /api/tenants lists all tenants
- [ ] Deduplication: uploading same URL twice updates first entry
- [ ] Error handling for invalid tenant/agent/channel

---

## Implementation Details

### Upsert Strategy (Route 6)
```typescript
// Find existing by URL (primary key)
if (url) {
  const existing = await prisma.contentItem.findFirst({
    where: { tenantId, channel, url }
  });
  if (existing) {
    // Update rawData and title
  } else {
    // Create new
  }
} else if (publishDate) {
  // Fallback: match by publishDate
} else {
  // Create as new (no dedup possible)
}

// Always upsert ChannelMetrics
await prisma.channelMetrics.upsert({
  where: { contentItemId },
  create: { ...metrics },
  update: { ...metrics }
});
```

### Agent Execution Flow (Route 4)
1. Validate tenant & agent exist
2. Check agent is enabled
3. Create AgentRun with status "RUNNING"
4. Call appropriate LLM analyzer based on agentType
5. Update AgentRun with result or error
6. Update Agent.lastRun timestamp
7. Return result or error

---

## Future Enhancements

- [ ] Batch imports with progress tracking
- [ ] Scheduled agent runs
- [ ] Webhook notifications on import completion
- [ ] Custom attribute definitions per agent
- [ ] Result caching and versioning
