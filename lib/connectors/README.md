# ContentPulse CSV/Excel Connectors

This directory contains file parsers for all 6 content channels supported by ContentPulse.

## Overview

Each connector module (`linkedin.ts`, `youtube.ts`, `blog.ts`, `email.ts`, `reddit.ts`, `ppc.ts`) exports a `parse()` function that:

- Accepts file input as: file path (string), Node.js Buffer, or ArrayBuffer
- Automatically detects CSV vs. Excel (.xlsx) format
- Performs case-insensitive column matching (e.g., "Post Date", "post_date", "POST_DATE" are equivalent)
- Normalizes all column names to lowercase with underscores
- Trims whitespace from all string values
- Returns `null` for empty/missing values (graceful degradation)
- Never throws errors; returns structured `ParseResult` with errors array

## Type Definitions

### `NormalizedRow`
```typescript
interface NormalizedRow {
  [key: string]: null | string | number;
}
```
A flexible object where all column values are either `null`, a trimmed string, or a number.

### `ParseResult`
```typescript
interface ParseResult {
  rows: NormalizedRow[];
  errors: string[];
  rowCount: number;
}
```

## Connectors

### LinkedIn (`linkedin.ts`)
Parses LinkedIn post performance metrics.

**Expected Columns:**
- post_date, post_text, post_type, impressions, reach, likes, comments, shares, ctr, follower_growth, hashtags

**Usage:**
```typescript
import { LinkedIn } from '@/lib/connectors';

const result = await LinkedIn.parse('./data.csv');
console.log(result.rows[0]); // { post_date: '2024-01-15', likes: '42', ... }
```

### YouTube (`youtube.ts`)
Parses YouTube video performance metrics.

**Expected Columns:**
- video_date, title, description, tags, duration_seconds, video_url, views, watch_time_hours, avg_view_duration_seconds, likes, comments, subscribers_gained, comment_text

### Blog (`blog.ts`)
Parses blog post performance metrics.

**Expected Columns:**
- publish_date, title, url, author, category, tags, word_count, format, pageviews, sessions, avg_time_on_page_seconds, bounce_rate, conversions, search_traffic, comment_text

### Email (`email.ts`)
Parses email campaign performance metrics.

**Expected Columns:**
- send_date, subject, audience_segment, cta_text, total_sent, open_rate, ctr, unsubscribes, leads_generated, conversions

### Reddit (`reddit.ts`)
Parses Reddit post performance metrics.

**Expected Columns:**
- post_date, subreddit, post_title, post_text, post_url, upvotes, comment_count, top_comments, mention_frequency, trend_velocity

### PPC (`ppc.ts`)
Parses PPC (Pay-Per-Click) ad campaign data.

**Expected Columns:**
- date, campaign_name, ad_copy, keyword, search_term, landing_page_url, impressions, clicks, cpc, ctr, conversions, cost_per_conversion

## Utilities (`utils.ts`)

Core utility functions used by all connectors:

- `getFileType(filePath)` - Detect file format (.csv or .xlsx)
- `readFileAsText()` - Convert input to text (for CSV)
- `readFileAsBuffer()` - Convert input to ArrayBuffer (for Excel)
- `normalizeColumnName()` - Lowercase and trim column names
- `parseCSV()` - Parse CSV using PapaParse
- `parseExcel()` - Parse Excel using SheetJS (xlsx)
- `findColumn()` - Case-insensitive column matching
- `buildColumnMapping()` - Map required columns to actual columns
- `normalizeRow()` - Apply normalization to a single row
- `parseFile()` - Generic parser template (used by all connectors)

## Features

### Case-Insensitive Column Matching
All column names are normalized and matched case-insensitively. These all produce the same result:

```typescript
// All equivalent:
await LinkedIn.parse('./data.csv'); // original: "Post Date"
await LinkedIn.parse('./data.csv'); // original: "post_date"
await LinkedIn.parse('./data.csv'); // original: "POST_DATE"

// Result: { post_date: '2024-01-15', ... }
```

### Graceful Degradation
Missing columns or values don't cause errors; they result in `null`:

```typescript
const result = await LinkedIn.parse('./incomplete.csv');
console.log(result.errors); // []
console.log(result.rows[0].hashtags); // null (if column missing)
```

### Mixed Format Support
Automatically detects and parses both CSV and Excel:

```typescript
await LinkedIn.parse('./data.csv');   // CSV
await LinkedIn.parse('./data.xlsx');  // Excel
await LinkedIn.parse(csvBuffer);      // Buffer
await LinkedIn.parse(arrayBuffer);    // ArrayBuffer
```

### Explicit Type Override
If automatic detection fails, specify the format:

```typescript
const result = await LinkedIn.parseWithType(data, 'xlsx');
```

## Integration with API Routes

Example API endpoint for file upload:

```typescript
// app/api/upload/route.ts
import { LinkedIn } from '@/lib/connectors';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const buffer = await file.arrayBuffer();
  
  const result = await LinkedIn.parse(buffer);
  
  if (result.errors.length > 0) {
    return Response.json({ error: result.errors[0] }, { status: 400 });
  }
  
  return Response.json(result);
}
```

## Error Handling

All parsers return errors in the `errors` array rather than throwing:

```typescript
const result = await LinkedIn.parse('./invalid.txt');
console.log(result.errors); // ['CSV parsing failed: ...']
console.log(result.rows);   // []
console.log(result.rowCount); // 0
```

## Column Value Types

All values are normalized to one of three types:

- **null** - Column missing, empty, or whitespace-only
- **string** - Text values (trimmed of whitespace)
- **number** - Already numeric in source (preserved as-is)

```typescript
// Example normalized row:
{
  post_date: '2024-01-15',           // string
  likes: 42,                         // number
  impressions: '1500',               // string (if sourced as string)
  hashtags: null,                    // null (if missing or empty)
}
```

## Dependencies

- `papaparse` (v5.5.4+) - CSV parsing
- `xlsx` (v0.18.5+) - Excel parsing
- TypeScript (v5.3+)

Both are included in package.json.
