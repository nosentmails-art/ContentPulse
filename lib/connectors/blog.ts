/**
 * Blog CSV/Excel Connector
 * Parses blog post performance data
 */

import { NormalizedRow, ParseResult } from './types';
import { parseFile, getFileType } from './utils';

const BLOG_COLUMNS = [
  'publish_date',
  'title',
  'url',
  'author',
  'category',
  'tags',
  'word_count',
  'format',
  'pageviews',
  'sessions',
  'avg_time_on_page_seconds',
  'bounce_rate',
  'conversions',
  'search_traffic',
  'comment_text',
];

/**
 * Parse blog data from CSV or Excel file
 * @param input File path (string), Buffer, or ArrayBuffer
 * @returns ParseResult with normalized rows, errors, and row count
 */
export async function parse(
  input: string | Buffer | ArrayBuffer
): Promise<ParseResult> {
  const fileType = getFileType(typeof input === 'string' ? input : 'data.csv');
  return parseFile(input, fileType === 'xlsx' ? 'xlsx' : 'csv', BLOG_COLUMNS);
}

/**
 * Parse with explicit file type override
 */
export async function parseWithType(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx'
): Promise<ParseResult> {
  return parseFile(input, fileType, BLOG_COLUMNS);
}
