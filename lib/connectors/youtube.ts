/**
 * YouTube CSV/Excel Connector
 * Parses YouTube video performance data
 */

import { NormalizedRow, ParseResult } from './types';
import { parseFile, getFileType } from './utils';

const YOUTUBE_COLUMNS = [
  'video_date',
  'title',
  'description',
  'tags',
  'duration_seconds',
  'video_url',
  'views',
  'watch_time_hours',
  'avg_view_duration_seconds',
  'likes',
  'comments',
  'subscribers_gained',
  'comment_text',
];

/**
 * Parse YouTube data from CSV or Excel file
 * @param input File path (string), Buffer, or ArrayBuffer
 * @returns ParseResult with normalized rows, errors, and row count
 */
export async function parse(
  input: string | Buffer | ArrayBuffer
): Promise<ParseResult> {
  const fileType = getFileType(typeof input === 'string' ? input : 'data.csv');
  return parseFile(input, fileType === 'xlsx' ? 'xlsx' : 'csv', YOUTUBE_COLUMNS);
}

/**
 * Parse with explicit file type override
 */
export async function parseWithType(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx'
): Promise<ParseResult> {
  return parseFile(input, fileType, YOUTUBE_COLUMNS);
}
