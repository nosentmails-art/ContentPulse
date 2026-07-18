/**
 * Shared utilities for CSV/Excel parsing
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { NormalizedRow, ParseResult } from './types';

/**
 * Detect file type by extension or attempt to determine from content
 */
export function getFileType(filePath: string): 'csv' | 'xlsx' | 'unknown' {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return 'xlsx';
  }
  if (lower.endsWith('.csv')) {
    return 'csv';
  }
  return 'unknown';
}

/**
 * Read file content as text
 */
export async function readFileAsText(input: string | Buffer | ArrayBuffer): Promise<string> {
  if (typeof input === 'string') {
    // It's a file path - would need fs module in Node.js
    // For now, assume it's already text content passed as string
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new TextDecoder().decode(input);
  }
  if (Buffer.isBuffer(input)) {
    return input.toString('utf-8');
  }
  throw new Error('Unsupported input type for file parsing');
}

/**
 * Read file as ArrayBuffer for Excel parsing
 */
export async function readFileAsBuffer(input: string | Buffer | ArrayBuffer): Promise<ArrayBuffer> {
  if (input instanceof ArrayBuffer) {
    return input;
  }
  if (Buffer.isBuffer(input)) {
    return (input.buffer as ArrayBuffer).slice(input.byteOffset, input.byteOffset + input.byteLength);
  }
  if (typeof input === 'string') {
    // Assume it's already a string representation - convert back
    const encoder = new TextEncoder();
    return encoder.encode(input).buffer;
  }
  throw new Error('Unsupported input type for file parsing');
}

/**
 * Normalize column names: trim and lowercase
 */
export function normalizeColumnName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Parse CSV content using PapaParse
 */
export function parseCSV(content: string): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({
          headers,
          rows: results.data as Record<string, any>[],
        });
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Parse Excel file (.xlsx)
 */
export function parseExcel(buffer: ArrayBuffer): { headers: string[]; rows: Record<string, any>[] } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
    const headers = Object.keys(rows[0] || {});
    return { headers, rows };
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Match a required column name case-insensitively
 * Returns the original column name if found, null otherwise
 */
export function findColumn(
  requiredColumn: string,
  availableColumns: string[]
): string | null {
  const normalized = normalizeColumnName(requiredColumn);
  return (
    availableColumns.find((col) => normalizeColumnName(col) === normalized) || null
  );
}

/**
 * Build a mapping from required columns to actual column names
 * Rows with missing required columns will have null for those fields
 */
export function buildColumnMapping(
  requiredColumns: string[],
  availableColumns: string[]
): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};
  for (const req of requiredColumns) {
    mapping[normalizeColumnName(req)] = findColumn(req, availableColumns);
  }
  return mapping;
}

/**
 * Normalize a single row: apply column mapping and trim values
 */
export function normalizeRow(
  rawRow: Record<string, any>,
  columnMapping: Record<string, string | null>,
  requiredColumns: string[]
): NormalizedRow {
  const normalized: NormalizedRow = {};

  for (const required of requiredColumns) {
    const normalizedName = normalizeColumnName(required);
    const actualColumn = columnMapping[normalizedName];

    if (actualColumn && actualColumn in rawRow) {
      const value = rawRow[actualColumn];
      if (value === null || value === undefined || value === '') {
        normalized[normalizedName] = null;
      } else if (typeof value === 'number') {
        normalized[normalizedName] = value;
      } else {
        // Trim whitespace from strings
        const trimmed = String(value).trim();
        normalized[normalizedName] = trimmed === '' ? null : trimmed;
      }
    } else {
      // Column not found in data
      normalized[normalizedName] = null;
    }
  }

  return normalized;
}

/**
 * Generic parse function template for all connectors
 */
export async function parseFile(
  input: string | Buffer | ArrayBuffer,
  fileType: 'csv' | 'xlsx',
  requiredColumns: string[]
): Promise<ParseResult> {
  try {
    let headers: string[];
    let rows: Record<string, any>[];

    if (fileType === 'csv') {
      const content = await readFileAsText(input);
      ({ headers, rows } = await parseCSV(content));
    } else if (fileType === 'xlsx') {
      const buffer = await readFileAsBuffer(input);
      ({ headers, rows } = parseExcel(buffer));
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    const columnMapping = buildColumnMapping(requiredColumns, headers);
    const normalizedRows: NormalizedRow[] = rows.map((row) =>
      normalizeRow(row, columnMapping, requiredColumns)
    );

    return {
      rows: normalizedRows,
      errors: [],
      rowCount: normalizedRows.length,
    };
  } catch (error) {
    return {
      rows: [],
      errors: [error instanceof Error ? error.message : String(error)],
      rowCount: 0,
    };
  }
}
