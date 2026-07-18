/**
 * Shared types for all CSV/Excel connectors
 */

/**
 * Normalized row object with flexible key-value pairs
 * All values are either null (missing/empty), string, or number
 */
export interface NormalizedRow {
  [key: string]: null | string | number;
}

/**
 * Parser result from any connector
 */
export interface ParseResult {
  rows: NormalizedRow[];
  errors: string[];
  rowCount: number;
}

/**
 * Column mapping type: original column name -> normalized name
 */
export type ColumnMapping = Record<string, string>;
