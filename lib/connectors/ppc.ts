/**
 * PPC CSV/Excel Connector
 * Parses PPC (Pay-Per-Click) ad campaign data
 */

import { NormalizedRow, ParseResult } from './types';
import { parseFile, getFileType } from './utils';

const PPC_COLUMNS = [
  'date',
  'campaign_name',
  'ad_copy',
  'keyword',
  'search_term',
  'landing_page_url',
  'impressions',
  'clicks',
  'cpc',
  'ctr',
  'conversions',
  'cost_per_conversion',
];

/**
 * Parse PPC data from CSV or Excel file
 * @param input File path (string), Buffer, or ArrayBuffer
 * @returns ParseResult with normalized rows, errors, and row count
 */
export async function parse(
  input: string | Buffer | ArrayBuffer
): Promise<ParseResult> {
  const fileType = getFileType(typeof input === 'string' ? input : 'data.csv');
  return parseFile(input, fileType === 'xlsx' ? 'xlsx' : 'csv', PPC_COLUMNS);
}

/**
 * Parse with explicit file type override
 */
export async function parseWithType(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx'
): Promise<ParseResult> {
  return parseFile(input, fileType, PPC_COLUMNS);
}
