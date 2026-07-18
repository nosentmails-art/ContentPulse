/**
 * Email CSV/Excel Connector
 * Parses email campaign performance data
 */

import { NormalizedRow, ParseResult } from './types';
import { parseFile, getFileType } from './utils';

const EMAIL_COLUMNS = [
  'send_date',
  'subject',
  'audience_segment',
  'cta_text',
  'total_sent',
  'open_rate',
  'ctr',
  'unsubscribes',
  'leads_generated',
  'conversions',
];

/**
 * Parse email data from CSV or Excel file
 * @param input File path (string), Buffer, or ArrayBuffer
 * @returns ParseResult with normalized rows, errors, and row count
 */
export async function parse(
  input: string | Buffer | ArrayBuffer
): Promise<ParseResult> {
  const fileType = getFileType(typeof input === 'string' ? input : 'data.csv');
  return parseFile(input, fileType === 'xlsx' ? 'xlsx' : 'csv', EMAIL_COLUMNS);
}

/**
 * Parse with explicit file type override
 */
export async function parseWithType(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx'
): Promise<ParseResult> {
  return parseFile(input, fileType, EMAIL_COLUMNS);
}
