import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
  };
}

/**
 * POST /api/[tenant]/competitors
 * Add a new competitor to track
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug } = params;
    const body = await req.json();
    const { name, url, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Competitor name is required' }, { status: 400 });
    }

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create competitor
    const competitor = await db.competitor.create({
      data: {
        tenantId: tenant.id,
        name,
        url: url || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error('[POST /api/[tenant]/competitors] Error:', error);
    return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 });
  }
}

/**
 * GET /api/[tenant]/competitors
 * Fetch all competitors for a tenant
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug } = params;

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch competitors
    const competitors = await db.competitor.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error('[GET /api/[tenant]/competitors] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 });
  }
}
