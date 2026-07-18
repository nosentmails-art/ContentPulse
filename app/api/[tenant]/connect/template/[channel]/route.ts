import { NextResponse, NextRequest } from 'next/server';

interface RouteParams {
  params: {
    tenant: string;
    channel: string;
  };
}

/**
 * GET /api/[tenant]/connect/template/[channel]
 * Download a CSV template for the specified channel
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { channel } = params;

    // Channel-specific CSV templates
    const templates: Record<string, { headers: string[]; description: string }> = {
      LINKEDIN: {
        headers: ['Date', 'Post ID', 'Content', 'Likes', 'Comments', 'Shares', 'Views', 'Engagement Rate'],
        description: 'LinkedIn engagement metrics',
      },
      YOUTUBE: {
        headers: ['Date', 'Video ID', 'Title', 'Views', 'Likes', 'Comments', 'Watch Time (hours)', 'Avg. Duration'],
        description: 'YouTube video performance metrics',
      },
      BLOG: {
        headers: ['Date', 'URL', 'Title', 'Page Views', 'Unique Visitors', 'Avg. Time on Page', 'Bounce Rate', 'Shares'],
        description: 'Blog post metrics',
      },
      EMAIL: {
        headers: ['Date', 'Campaign ID', 'Subject', 'Sent', 'Opened', 'Clicked', 'Unsubscribed', 'Revenue'],
        description: 'Email campaign metrics',
      },
      REDDIT: {
        headers: ['Date', 'Post ID', 'Title', 'Upvotes', 'Comments', 'Shares', 'Views', 'Sentiment'],
        description: 'Reddit post metrics',
      },
      GOOGLE_PPC: {
        headers: ['Date', 'Campaign', 'Ad Group', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'ROI'],
        description: 'Google PPC campaign metrics',
      },
    };

    const template = templates[channel];

    if (!template) {
      return NextResponse.json(
        { error: `Unknown channel: ${channel}` },
        { status: 400 }
      );
    }

    // Generate CSV content
    const csvContent = [
      template.headers.join(','),
      // Example row with placeholder data
      Array(template.headers.length).fill('').join(','),
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${channel.toLowerCase()}_template.csv"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/[tenant]/connect/template/[channel]] Error:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
