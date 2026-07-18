import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/tenants
 * Fetch all available tenants for the tenant switcher
 */
export async function GET() {
  try {
    const tenants = await db.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('[GET /api/tenants] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}
