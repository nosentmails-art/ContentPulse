/**
 * LinkedIn CSV/Excel Connector
 * Parses LinkedIn post performance data
 */

import { NormalizedRow, ParseResult } from './types';
import { parseFile, getFileType } from './utils';

const LINKEDIN_COLUMNS = [
  'post_date',
  'post_text',
  'post_type',
  'impressions',
  'reach',
  'likes',
  'comments',
  'shares',
  'ctr',
  'follower_growth',
  'hashtags',
];

/**
 * Parse LinkedIn data from CSV or Excel file
 * @param input File path (string), Buffer, or ArrayBuffer
 * @returns ParseResult with normalized rows, errors, and row count
 */
export async function parse(
  input: string | Buffer | ArrayBuffer
): Promise<ParseResult> {
  const fileType = getFileType(typeof input === 'string' ? input : 'data.csv');
  return parseFile(input, fileType === 'xlsx' ? 'xlsx' : 'csv', LINKEDIN_COLUMNS);
}

/**
 * Parse with explicit file type override
 */
export async function parseWithType(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx'
): Promise<ParseResult> {
  return parseFile(input, fileType, LINKEDIN_COLUMNS);
}
