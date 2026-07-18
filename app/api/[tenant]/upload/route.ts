import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import * as LinkedIn from '../../../../lib/connectors/linkedin';
import * as YouTube from '../../../../lib/connectors/youtube';
import * as Blog from '../../../../lib/connectors/blog';
import * as Email from '../../../../lib/connectors/email';
import * as Reddit from '../../../../lib/connectors/reddit';
import * as PPC from '../../../../lib/connectors/ppc';

/**
 * POST /api/[slug]/upload
 * File upload endpoint (CSV/Excel)
 * Accepts file + channel parameter
 * Parses file and upserts ContentItem + ChannelMetrics to DB
 * Returns { success, rowsImported, errors, preview }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const slug = params.tenant;

    // Resolve slug to tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantId = tenant.id;

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const channel = formData.get('channel') as string;

    if (!file || !channel) {
      return NextResponse.json(
        { error: 'Missing file or channel parameter' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Parse file using appropriate connector
    let parseResult;
    try {
      switch (channel.toUpperCase()) {
        case 'LINKEDIN':
          parseResult = await LinkedIn.parse(buffer);
          break;
        case 'YOUTUBE':
          parseResult = await YouTube.parse(buffer);
          break;
        case 'BLOG':
          parseResult = await Blog.parse(buffer);
          break;
        case 'EMAIL_NEWSLETTER':
          parseResult = await Email.parse(buffer);
          break;
        case 'REDDIT':
          parseResult = await Reddit.parse(buffer);
          break;
        case 'GOOGLE_PPC':
          parseResult = await PPC.parse(buffer);
          break;
        default:
          return NextResponse.json(
            { error: 'Unknown channel: ' + channel },
            { status: 400 }
          );
      }
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      return NextResponse.json(
        {
          success: false,
          rowsImported: 0,
          errors: [errorMessage],
          preview: [],
        },
        { status: 400 }
      );
    }

    // Handle parse errors
    if (parseResult.errors.length > 0 && parseResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          rowsImported: 0,
          errors: parseResult.errors,
          preview: [],
        },
        { status: 400 }
      );
    }

    // Import rows to database with upsert logic
    const importedIds: string[] = [];
    const errors: string[] = [...parseResult.errors];

    for (const row of parseResult.rows) {
      try {
        // Extract URL and publishDate from row for deduplication
        const url =
          (row.url as string) ||
          (row.post_url as string) ||
          (row.video_url as string) ||
          (row.article_url as string) ||
          null;

        const publishDateStr =
          (row.publish_date as string) ||
          (row.post_date as string) ||
          (row.published_at as string) ||
          null;

        const publishDate = publishDateStr
          ? new Date(publishDateStr)
          : null;

        const title = (row.title ||
          row.post_text ||
          row.post_title ||
          'Untitled') as string;

        // Deduplication strategy: find existing by URL or publishDate
        let existingItem = null;
        if (url) {
          existingItem = await prisma.contentItem.findFirst({
            where: {
              tenantId,
              channel,
              url,
            },
          });
        } else if (publishDate) {
          // Fallback: match on publishDate if URL not available
          existingItem = await prisma.contentItem.findFirst({
            where: {
              tenantId,
              channel,
              publishDate,
            },
          });
        }

        let contentItem;
        if (existingItem) {
          // Update existing
          contentItem = await prisma.contentItem.update({
            where: { id: existingItem.id },
            data: {
              rawData: JSON.stringify(row),
              title,
            },
          });
        } else {
          // Create new
          contentItem = await prisma.contentItem.create({
            data: {
              tenantId,
              channel,
              url,
              title,
              publishDate,
              rawData: JSON.stringify(row),
            },
          });
        }

        // Upsert ChannelMetrics
        await prisma.channelMetrics.upsert({
          where: { contentItemId: contentItem.id },
          create: {
            contentItemId: contentItem.id,
            impressions:
              typeof row.impressions === 'number' ? row.impressions : null,
            reach: typeof row.reach === 'number' ? row.reach : null,
            clicks: typeof row.clicks === 'number' ? row.clicks : null,
            ctr: typeof row.ctr === 'number' ? row.ctr : null,
            likes: typeof row.likes === 'number' ? row.likes : null,
            comments:
              typeof row.comments === 'number' ? row.comments : null,
            shares: typeof row.shares === 'number' ? row.shares : null,
            followerGrowth:
              typeof row.follower_growth === 'number'
                ? row.follower_growth
                : null,
            views: typeof row.views === 'number' ? row.views : null,
            watchTime:
              typeof row.watch_time === 'number' ? row.watch_time : null,
            avgViewDuration:
              typeof row.avg_view_duration === 'number'
                ? row.avg_view_duration
                : null,
            subscribersGained:
              typeof row.subscribers_gained === 'number'
                ? row.subscribers_gained
                : null,
            sessions: typeof row.sessions === 'number' ? row.sessions : null,
            timeOnPage:
              typeof row.time_on_page === 'number' ? row.time_on_page : null,
            bounceRate:
              typeof row.bounce_rate === 'number' ? row.bounce_rate : null,
            conversions:
              typeof row.conversions === 'number' ? row.conversions : null,
            searchTraffic:
              typeof row.search_traffic === 'number'
                ? row.search_traffic
                : null,
            wordCount:
              typeof row.word_count === 'number'
                ? row.word_count
                : null,
            openRate:
              typeof row.open_rate === 'number' ? row.open_rate : null,
            unsubscribes:
              typeof row.unsubscribes === 'number' ? row.unsubscribes : null,
            leadsGenerated:
              typeof row.leads_generated === 'number'
                ? row.leads_generated
                : null,
            upvotes: typeof row.upvotes === 'number' ? row.upvotes : null,
            mentionFrequency:
              typeof row.mention_frequency === 'number'
                ? row.mention_frequency
                : null,
            trendVelocity:
              typeof row.trend_velocity === 'number'
                ? row.trend_velocity
                : null,
            cpc: typeof row.cpc === 'number' ? row.cpc : null,
            costPerConversion:
              typeof row.cost_per_conversion === 'number'
                ? row.cost_per_conversion
                : null,
            commentText:
              typeof row.comment_text === 'string'
                ? row.comment_text
                : null,
          },
          update: {
            impressions:
              typeof row.impressions === 'number' ? row.impressions : null,
            reach: typeof row.reach === 'number' ? row.reach : null,
            clicks: typeof row.clicks === 'number' ? row.clicks : null,
            ctr: typeof row.ctr === 'number' ? row.ctr : null,
            likes: typeof row.likes === 'number' ? row.likes : null,
            comments:
              typeof row.comments === 'number' ? row.comments : null,
            shares: typeof row.shares === 'number' ? row.shares : null,
            followerGrowth:
              typeof row.follower_growth === 'number'
                ? row.follower_growth
                : null,
            views: typeof row.views === 'number' ? row.views : null,
            watchTime:
              typeof row.watch_time === 'number' ? row.watch_time : null,
            avgViewDuration:
              typeof row.avg_view_duration === 'number'
                ? row.avg_view_duration
                : null,
            subscribersGained:
              typeof row.subscribers_gained === 'number'
                ? row.subscribers_gained
                : null,
            sessions: typeof row.sessions === 'number' ? row.sessions : null,
            timeOnPage:
              typeof row.time_on_page === 'number' ? row.time_on_page : null,
            bounceRate:
              typeof row.bounce_rate === 'number' ? row.bounce_rate : null,
            conversions:
              typeof row.conversions === 'number' ? row.conversions : null,
            searchTraffic:
              typeof row.search_traffic === 'number'
                ? row.search_traffic
                : null,
            wordCount:
              typeof row.word_count === 'number'
                ? row.word_count
                : null,
            openRate:
              typeof row.open_rate === 'number' ? row.open_rate : null,
            unsubscribes:
              typeof row.unsubscribes === 'number' ? row.unsubscribes : null,
            leadsGenerated:
              typeof row.leads_generated === 'number'
                ? row.leads_generated
                : null,
            upvotes: typeof row.upvotes === 'number' ? row.upvotes : null,
            mentionFrequency:
              typeof row.mention_frequency === 'number'
                ? row.mention_frequency
                : null,
            trendVelocity:
              typeof row.trend_velocity === 'number'
                ? row.trend_velocity
                : null,
            cpc: typeof row.cpc === 'number' ? row.cpc : null,
            costPerConversion:
              typeof row.cost_per_conversion === 'number'
                ? row.cost_per_conversion
                : null,
            commentText:
              typeof row.comment_text === 'string'
                ? row.comment_text
                : null,
          },
        });

        importedIds.push(contentItem.id);
      } catch (rowError) {
        const errorMsg = rowError instanceof Error ? rowError.message : 'Unknown row error';
        console.error('Error importing row:', rowError);
        errors.push(`Row error: ${errorMsg}`);
      }
    }

    // Get preview (first 5 rows)
    const preview = parseResult.rows.slice(0, 5);

    return NextResponse.json({
      success: true,
      rowsImported: importedIds.length,
      errors,
      preview,
    });
  } catch (error) {
    console.error('Error in POST /api/[tenant]/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
