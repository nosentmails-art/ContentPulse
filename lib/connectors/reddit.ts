/**
 * Reddit CSV/Excel Connector
 * Parses Reddit post performance data
 */

import { NormalizedRow, ParseResult } from './types';
import { parseFile, getFileType } from './utils';

const REDDIT_COLUMNS = [
  'post_date',
  'subreddit',
  'post_title',
  'post_text',
  'post_url',
  'upvotes',
  'comment_count',
  'top_comments',
  'mention_frequency',
  'trend_velocity',
];

/**
 * Parse Reddit data from CSV or Excel file
 * @param input File path (string), Buffer, or ArrayBuffer
 * @returns ParseResult with normalized rows, errors, and row count
 */
export async function parse(
  input: string | Buffer | ArrayBuffer
): Promise<ParseResult> {
  const fileType = getFileType(typeof input === 'string' ? input : 'data.csv');
  return parseFile(input, fileType === 'xlsx' ? 'xlsx' : 'csv', REDDIT_COLUMNS);
}

/**
 * Parse with explicit file type override
 */
export async function parseWithType(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx'
): Promise<ParseResult> {
  return parseFile(input, fileType, REDDIT_COLUMNS);
}
