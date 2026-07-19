/**
 * Sentiment Analysis API Route
 * GET/POST /api/[tenant]/agents/sentiment
 * 
 * Returns channel-wise sentiment analysis with weighted brand sentiment
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { analyzeSentiment } from '@/lib/agents';

/**
 * GET /api/[tenant]/agents/sentiment
 * Query parameters: ?attributes=sentiment_score,themes,recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const { tenant: slug } = params;

    // Resolve tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found', slug },
        { status: 404 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const attributesParam = searchParams.get('attributes');
    const attributes = attributesParam
      ? attributesParam.split(',').map(a => a.trim())
      : ['sentiment_score', 'themes', 'recommendations'];

    // Run sentiment analysis
    const result = await analyzeSentiment(tenant.id, attributes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sentiment analysis failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[sentiment/route] GET Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[tenant]/agents/sentiment
 * Body: { attributes: ["sentiment_score", "themes", "recommendations"] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const { tenant: slug } = params;

    // Resolve tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found', slug },
        { status: 404 }
      );
    }

    // Parse request body
    let attributes: string[] = ['sentiment_score', 'themes', 'recommendations'];
    
    try {
      const body = await request.json();
      if (body.attributes && Array.isArray(body.attributes)) {
        attributes = body.attributes;
      }
    } catch {
      // Use defaults if body is invalid
    }

    // Run sentiment analysis
    const result = await analyzeSentiment(tenant.id, attributes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sentiment analysis failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[sentiment/route] POST Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
