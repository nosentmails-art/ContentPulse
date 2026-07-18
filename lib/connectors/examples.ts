/**
 * Example usage and tests for ContentPulse connectors
 * This file demonstrates how to use each connector
 */

import * as Connectors from './index';

/**
 * Example: Parse LinkedIn data
 */
async function exampleLinkedInParse() {
  // From file path
  const resultFromPath = await Connectors.LinkedIn.parse('./linkedin-data.csv');
  console.log(`Parsed ${resultFromPath.rowCount} LinkedIn posts`);
  
  if (resultFromPath.errors.length > 0) {
    console.error('Errors:', resultFromPath.errors);
  } else {
    console.log('First row:', resultFromPath.rows[0]);
  }
}

/**
 * Example: Parse YouTube data from buffer
 */
async function exampleYouTubeParse(buffer: Buffer) {
  const result = await Connectors.YouTube.parse(buffer);
  console.log(`Parsed ${result.rowCount} YouTube videos`);
  
  result.rows.forEach((row) => {
    console.log(`Title: ${row.title}, Views: ${row.views}`);
  });
}

/**
 * Example: Parse Excel blog data
 */
async function exampleBlogParseExcel(buffer: ArrayBuffer) {
  const result = await Connectors.Blog.parseWithType(buffer, 'xlsx');
  console.log(`Parsed ${result.rowCount} blog posts`);
  
  result.rows.forEach((row) => {
    console.log(`Author: ${row.author}, Title: ${row.title}`);
  });
}

/**
 * Example: Handling missing columns gracefully
 */
async function exampleGracefulDegradation(buffer: Buffer) {
  const result = await Connectors.Email.parse(buffer);
  
  // No errors even if columns are missing
  console.log('Errors:', result.errors); // []
  
  // Missing columns will have null values
  result.rows.forEach((row) => {
    const openRate = row.open_rate ?? 'N/A';
    const conversions = row.conversions ?? 'N/A';
    console.log(`Open Rate: ${openRate}, Conversions: ${conversions}`);
  });
}

/**
 * Example: Parse Reddit data
 */
async function exampleRedditParse(csvContent: string) {
  const result = await Connectors.Reddit.parse(csvContent);
  console.log(`Parsed ${result.rowCount} Reddit posts`);
  
  result.rows.forEach((row) => {
    console.log(`Subreddit: ${row.subreddit}, Title: ${row.post_title}, Upvotes: ${row.upvotes}`);
  });
}

/**
 * Example: Parse PPC campaign data
 */
async function examplePPCParse(buffer: Buffer) {
  const result = await Connectors.PPC.parse(buffer);
  console.log(`Parsed ${result.rowCount} PPC campaigns`);
  
  result.rows.forEach((row) => {
    console.log(`Campaign: ${row.campaign_name}, Conversions: ${row.conversions}, CPC: ${row.cpc}`);
  });
}

/**
 * Example: Type checking with NormalizedRow
 */
function exampleTypeChecking(row: Connectors.NormalizedRow) {
  // All values are null | string | number
  const value: null | string | number = row.some_column;
  
  // Type-safe operations
  if (value === null) {
    console.log('Column is empty');
  } else if (typeof value === 'number') {
    console.log(`Numeric value: ${value}`);
  } else {
    console.log(`String value: ${value}`);
  }
}

/**
 * Example: Using ParseResult type
 */
function exampleParseResult(result: Connectors.ParseResult) {
  console.log(`Success: ${result.rowCount} rows parsed`);
  console.log(`Errors: ${result.errors.length} issues found`);
  
  if (result.errors.length > 0) {
    console.error('Parse errors:', result.errors);
  }
  
  return result.rows;
}

export {
  exampleLinkedInParse,
  exampleYouTubeParse,
  exampleBlogParseExcel,
  exampleGracefulDegradation,
  exampleRedditParse,
  examplePPCParse,
  exampleTypeChecking,
  exampleParseResult,
};
