/**
 * Column Specifications Reference for All Connectors
 * 
 * This file documents all expected columns for each connector.
 * Column names are case-insensitive and whitespace-tolerant.
 */

/**
 * LinkedIn Connector Columns
 * File: linkedin.ts
 */
export const LINKEDIN_SPEC = {
  fileName: 'linkedin.ts',
  channelName: 'LinkedIn',
  description: 'LinkedIn post performance metrics',
  columns: [
    'post_date',       // Date of post publication
    'post_text',       // Text content of the post
    'post_type',       // Type of post (article, image, video, etc.)
    'impressions',     // Number of impressions
    'reach',           // Number of unique viewers
    'likes',           // Number of likes/reactions
    'comments',        // Number of comments
    'shares',          // Number of shares
    'ctr',             // Click-through rate
    'follower_growth', // Growth in followers
    'hashtags',        // Hashtags used in post
  ],
} as const;

/**
 * YouTube Connector Columns
 * File: youtube.ts
 */
export const YOUTUBE_SPEC = {
  fileName: 'youtube.ts',
  channelName: 'YouTube',
  description: 'YouTube video performance metrics',
  columns: [
    'video_date',               // Date video was published
    'title',                    // Video title
    'description',              // Video description
    'tags',                     // Video tags/keywords
    'duration_seconds',         // Video duration in seconds
    'video_url',                // Link to the video
    'views',                    // Total views
    'watch_time_hours',         // Total watch time in hours
    'avg_view_duration_seconds', // Average view duration
    'likes',                    // Number of likes
    'comments',                 // Number of comments
    'subscribers_gained',       // New subscribers gained
    'comment_text',             // Top/sample comment text
  ],
} as const;

/**
 * Blog Connector Columns
 * File: blog.ts
 */
export const BLOG_SPEC = {
  fileName: 'blog.ts',
  channelName: 'Blog',
  description: 'Blog post performance metrics',
  columns: [
    'publish_date',              // Date post was published
    'title',                     // Post title
    'url',                       // Post URL/permalink
    'author',                    // Post author name
    'category',                  // Post category/section
    'tags',                      // Post tags
    'word_count',                // Number of words in post
    'format',                    // Post format (article, guide, etc.)
    'pageviews',                 // Total pageviews
    'sessions',                  // Number of sessions
    'avg_time_on_page_seconds',  // Average time on page
    'bounce_rate',               // Bounce rate percentage
    'conversions',               // Number of conversions
    'search_traffic',            // Organic search traffic
    'comment_text',              // Sample comment text
  ],
} as const;

/**
 * Email Connector Columns
 * File: email.ts
 */
export const EMAIL_SPEC = {
  fileName: 'email.ts',
  channelName: 'Email',
  description: 'Email campaign performance metrics',
  columns: [
    'send_date',          // Date email was sent
    'subject',            // Email subject line
    'audience_segment',   // Target audience segment
    'cta_text',           // Call-to-action button text
    'total_sent',         // Total emails sent
    'open_rate',          // Open rate percentage
    'ctr',                // Click-through rate
    'unsubscribes',       // Number of unsubscribes
    'leads_generated',    // Leads generated from email
    'conversions',        // Number of conversions
  ],
} as const;

/**
 * Reddit Connector Columns
 * File: reddit.ts
 */
export const REDDIT_SPEC = {
  fileName: 'reddit.ts',
  channelName: 'Reddit',
  description: 'Reddit post performance metrics',
  columns: [
    'post_date',         // Date post was created
    'subreddit',         // Subreddit name
    'post_title',        // Post title
    'post_text',         // Post body text
    'post_url',          // URL to the post
    'upvotes',           // Number of upvotes
    'comment_count',     // Number of comments
    'top_comments',      // Top/sample comments
    'mention_frequency', // How often topic was mentioned
    'trend_velocity',    // Trending velocity/momentum
  ],
} as const;

/**
 * PPC Connector Columns
 * File: ppc.ts
 */
export const PPC_SPEC = {
  fileName: 'ppc.ts',
  channelName: 'PPC (Pay-Per-Click)',
  description: 'PPC ad campaign metrics',
  columns: [
    'date',                  // Campaign date
    'campaign_name',         // Name of campaign
    'ad_copy',               // Ad creative copy
    'keyword',               // Target keyword
    'search_term',           // Actual search term
    'landing_page_url',      // Landing page URL
    'impressions',           // Number of impressions
    'clicks',                // Number of clicks
    'cpc',                   // Cost per click
    'ctr',                   // Click-through rate
    'conversions',           // Number of conversions
    'cost_per_conversion',   // Cost per conversion
  ],
} as const;

/**
 * All specs reference
 */
export const ALL_CONNECTOR_SPECS = [
  LINKEDIN_SPEC,
  YOUTUBE_SPEC,
  BLOG_SPEC,
  EMAIL_SPEC,
  REDDIT_SPEC,
  PPC_SPEC,
] as const;

/**
 * Helper: Get specification by channel name
 */
export function getSpecByChannel(
  channelName: keyof typeof CHANNEL_MAP
) {
  const specs: Record<string, any> = {
    linkedin: LINKEDIN_SPEC,
    youtube: YOUTUBE_SPEC,
    blog: BLOG_SPEC,
    email: EMAIL_SPEC,
    reddit: REDDIT_SPEC,
    ppc: PPC_SPEC,
  };
  return specs[channelName.toLowerCase()] || null;
}

/**
 * Channel name mapping
 */
export const CHANNEL_MAP = {
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  blog: 'Blog',
  email: 'Email',
  reddit: 'Reddit',
  ppc: 'PPC',
} as const;

/**
 * Validate that parsed data contains expected columns
 */
export function validateAgainstSpec(
  row: Record<string, any>,
  specColumns: readonly string[]
): { isValid: boolean; missingColumns: string[] } {
  const rowKeys = Object.keys(row);
  const normalizedRowKeys = rowKeys.map((k) => k.toLowerCase().trim());
  const normalizedSpec = specColumns.map((c) => c.toLowerCase().trim());

  const missingColumns = normalizedSpec.filter(
    (col) => !normalizedRowKeys.includes(col)
  );

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
  };
}
