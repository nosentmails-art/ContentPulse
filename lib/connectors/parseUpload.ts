import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedContentRow {
  date?: string;
  channel: string;
  title: string;
  url?: string;
  metrics: Record<string, any>;
}

/**
 * Parse CSV file content
 */
export function parseCSV(csvContent: string): ParsedContentRow[] {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }

        const rows = results.data as Record<string, any>[];
        const parsed = rows.map((row) => normalizeRow(row));
        resolve(parsed.filter((row) => row !== null) as ParsedContentRow[]);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Parse Excel file buffer
 */
export async function parseExcel(buffer: Buffer): Promise<ParsedContentRow[]> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

    const parsed = rows.map((row) => normalizeRow(row));
    return parsed.filter((row) => row !== null) as ParsedContentRow[];
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Normalize a row from CSV/Excel to our ParsedContentRow format
 * Handles different column naming conventions
 */
function normalizeRow(row: Record<string, any>): ParsedContentRow | null {
  if (!row || Object.keys(row).length === 0) {
    return null;
  }

  // Try to identify the channel from common column names
  const channel = identifyChannel(row);
  if (!channel) {
    return null; // Skip rows without identifiable channel
  }

  // Extract title/content
  const title =
    row.Title ||
    row.title ||
    row.Subject ||
    row.subject ||
    row.Content ||
    row.content ||
    row['Post Title'] ||
    row['Video Title'] ||
    'Untitled';

  // Extract URL if present
  const url =
    row.URL ||
    row.url ||
    row.Url ||
    row.Link ||
    row.link ||
    row['Post ID'] ||
    row['Video ID'] ||
    undefined;

  // Extract date if present
  const dateStr = row.Date || row.date || row.DATE;

  // Extract all numeric columns as metrics
  const metrics: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      key.toLowerCase() !== 'title' &&
      key.toLowerCase() !== 'date' &&
      key.toLowerCase() !== 'url' &&
      key.toLowerCase() !== 'link' &&
      key.toLowerCase() !== 'content' &&
      typeof value === 'number' &&
      !isNaN(value)
    ) {
      metrics[key] = value;
    }
  }

  return {
    date: dateStr ? String(dateStr) : undefined,
    channel,
    title: String(title),
    url: url ? String(url) : undefined,
    metrics,
  };
}

/**
 * Identify the channel from row data
 * Looks for channel-specific column headers or values
 */
function identifyChannel(row: Record<string, any>): string | null {
  const rowText = JSON.stringify(row).toLowerCase();

  if (rowText.includes('linkedin')) return 'LINKEDIN';
  if (rowText.includes('youtube')) return 'YOUTUBE';
  if (rowText.includes('blog') || rowText.includes('page view')) return 'BLOG';
  if (rowText.includes('email') || rowText.includes('campaign')) return 'EMAIL';
  if (rowText.includes('reddit')) return 'REDDIT';
  if (rowText.includes('google') || rowText.includes('ppc')) return 'GOOGLE_PPC';

  // Default to first detected numeric metric as hint
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase().includes('engagement')) return 'LINKEDIN';
    if (key.toLowerCase().includes('views') && typeof value === 'number') return 'YOUTUBE';
    if (key.toLowerCase().includes('bounce')) return 'BLOG';
    if (key.toLowerCase().includes('open') || key.toLowerCase().includes('click')) return 'EMAIL';
    if (key.toLowerCase().includes('upvote')) return 'REDDIT';
    if (key.toLowerCase().includes('impression') || key.toLowerCase().includes('conversion'))
      return 'GOOGLE_PPC';
  }

  return null;
}

/**
 * Parse file based on extension
 */
export async function parseFile(
  file: File
): Promise<ParsedContentRow[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    return parseCSV(text);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    return parseExcel(Buffer.from(buffer));
  } else {
    throw new Error(`Unsupported file format. Please use CSV or Excel (.xlsx/.xls)`);
  }
}
