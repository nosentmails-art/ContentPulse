/**
 * Connector Verification & Integration Guide
 * 
 * This document provides integration examples for using connectors
 * in API routes and demonstrates proper error handling.
 */

// ============================================================
// EXAMPLE 1: Basic API Route for File Upload
// ============================================================

/*
// app/api/upload/linkedin/route.ts
import { LinkedIn } from '@/lib/connectors';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const buffer = await file.arrayBuffer();

    // Parse using LinkedIn connector
    const result = await LinkedIn.parse(buffer);

    // Check for parse errors
    if (result.errors.length > 0) {
      return Response.json(
        { error: result.errors[0], details: result.errors },
        { status: 400 }
      );
    }

    // Process parsed rows
    return Response.json({
      success: true,
      rowCount: result.rowCount,
      rows: result.rows,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================
// EXAMPLE 2: Multi-Channel Upload Handler
// ============================================================

/*
// app/api/upload/route.ts
import * as Connectors from '@/lib/connectors';

type ChannelType = 'linkedin' | 'youtube' | 'blog' | 'email' | 'reddit' | 'ppc';

const channelMap: Record<ChannelType, { parse: (input: any) => Promise<Connectors.ParseResult> }> = {
  linkedin: Connectors.LinkedIn,
  youtube: Connectors.YouTube,
  blog: Connectors.Blog,
  email: Connectors.Email,
  reddit: Connectors.Reddit,
  ppc: Connectors.PPC,
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const channel = formData.get('channel') as ChannelType;

  if (!file || !channel) {
    return Response.json(
      { error: 'File and channel are required' },
      { status: 400 }
    );
  }

  const connector = channelMap[channel];
  if (!connector) {
    return Response.json(
      { error: `Unknown channel: ${channel}` },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();
  const result = await connector.parse(buffer);

  if (result.errors.length > 0) {
    return Response.json(
      { error: 'Parse failed', details: result.errors },
      { status: 400 }
    );
  }

  return Response.json({
    channel,
    rowCount: result.rowCount,
    rows: result.rows,
  });
}
*/

// ============================================================
// EXAMPLE 3: Error Handling Strategy
// ============================================================

/*
async function handleFileUpload(file: File, channel: string) {
  try {
    const buffer = await file.arrayBuffer();
    const connector = getConnectorByChannel(channel);
    const result = await connector.parse(buffer);

    // Strategy 1: Fail on any error
    if (result.errors.length > 0) {
      throw new Error(`Parse failed: ${result.errors[0]}`);
    }

    // Strategy 2: Warn but continue (graceful degradation)
    if (result.rowCount === 0) {
      console.warn('No rows parsed from file');
    }

    // Process rows
    return result.rows;
  } catch (error) {
    // Log and re-throw
    console.error('Upload error:', error);
    throw error;
  }
}
*/

// ============================================================
// EXAMPLE 4: Type-Safe Data Access
// ============================================================

/*
import { NormalizedRow } from '@/lib/connectors';

function processLinkedInRow(row: NormalizedRow) {
  // Safe type checking
  const postDate = row.post_date;      // null | string | number
  const likes = row.likes;              // null | string | number
  const hashtags = row.hashtags;        // null | string | number

  // Handle nulls
  const formattedDate = postDate ? String(postDate) : 'Unknown';
  const likeCount = typeof likes === 'number' ? likes : 0;

  return {
    date: formattedDate,
    engagement: likeCount,
    hashtags: hashtags ? String(hashtags) : '',
  };
}
*/

// ============================================================
// EXAMPLE 5: Batch Processing
// ============================================================

/*
async function processBatchUpload(files: File[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      return LinkedIn.parse(buffer);
    })
  );

  // Combine results
  const allRows: NormalizedRow[] = [];
  const allErrors: string[] = [];

  results.forEach((result) => {
    allRows.push(...result.rows);
    allErrors.push(...result.errors);
  });

  return {
    totalRows: allRows.length,
    totalErrors: allErrors.length,
    rows: allRows,
    errors: allErrors,
  };
}
*/

// ============================================================
// EXAMPLE 6: Column Verification
// ============================================================

/*
import { getSpecByChannel, validateAgainstSpec } from '@/lib/connectors/specs';

async function validateUploadedData(
  buffer: ArrayBuffer,
  channel: string
) {
  const connector = getConnectorByChannel(channel);
  const result = await connector.parse(buffer);

  const spec = getSpecByChannel(channel as any);
  if (!spec) {
    throw new Error(`No spec for channel: ${channel}`);
  }

  // Validate first row
  if (result.rows.length > 0) {
    const validation = validateAgainstSpec(
      result.rows[0],
      spec.columns
    );

    if (!validation.isValid) {
      console.warn(
        `Missing columns: ${validation.missingColumns.join(', ')}`
      );
    }
  }

  return result;
}
*/

// ============================================================
// EXAMPLE 7: Storage/Database Integration
// ============================================================

/*
import { prisma } from '@/lib/prisma';
import { LinkedIn } from '@/lib/connectors';

async function storeLinkedInData(
  buffer: ArrayBuffer,
  tenantId: string
) {
  const result = await LinkedIn.parse(buffer);

  if (result.errors.length > 0) {
    throw new Error(`Parse failed: ${result.errors[0]}`);
  }

  // Store in database
  const stored = await prisma.linkedInPost.createMany({
    data: result.rows.map((row) => ({
      tenantId,
      postDate: row.post_date ? new Date(String(row.post_date)) : null,
      postText: row.post_text as string | null,
      postType: row.post_type as string | null,
      impressions: typeof row.impressions === 'number' ? row.impressions : null,
      reach: typeof row.reach === 'number' ? row.reach : null,
      likes: typeof row.likes === 'number' ? row.likes : null,
      comments: typeof row.comments === 'number' ? row.comments : null,
      shares: typeof row.shares === 'number' ? row.shares : null,
      ctr: row.ctr as string | null,
      followerGrowth: row.follower_growth as string | null,
      hashtags: row.hashtags as string | null,
    })),
  });

  return stored;
}
*/

// ============================================================
// SUPPORTED INPUT TYPES
// ============================================================

/*
import { LinkedIn } from '@/lib/connectors';

// Option 1: File path (string)
const result1 = await LinkedIn.parse('./data.csv');

// Option 2: Node.js Buffer
import { readFileSync } from 'fs';
const buffer = readFileSync('./data.csv');
const result2 = await LinkedIn.parse(buffer);

// Option 3: Web API ArrayBuffer
const file = new File(['csv data'], 'data.csv');
const arrayBuffer = await file.arrayBuffer();
const result3 = await LinkedIn.parse(arrayBuffer);

// Option 4: Explicit file type
const result4 = await LinkedIn.parseWithType(buffer, 'xlsx');
*/

// ============================================================
// FEATURES SUMMARY
// ============================================================

/*
✅ 6 Channel Connectors
   - LinkedIn, YouTube, Blog, Email, Reddit, PPC

✅ Format Support
   - CSV (via PapaParse)
   - Excel/XLSX (via SheetJS)
   - Automatic detection by file extension

✅ Input Flexibility
   - File path (string)
   - Node.js Buffer
   - Web ArrayBuffer
   - Explicit type override

✅ Column Handling
   - Case-insensitive matching
   - Whitespace trimming
   - Graceful missing columns (returns null)
   - No errors thrown for missing data

✅ Type Safety
   - TypeScript interfaces (NormalizedRow, ParseResult)
   - Proper error handling
   - Structured error messages

✅ Error Handling
   - Errors returned in array (never thrown)
   - Partial failures gracefully handled
   - Empty result set when parsing fails

✅ Utilities
   - Column normalization
   - File type detection
   - Column mapping
   - Row normalization
   - Generic parse template
*/

export {};
