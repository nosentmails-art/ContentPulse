import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';

/**
 * GET /api/tenants
 * List all tenants (for switcher)
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({
      tenants,
    });
  } catch (error) {
    console.error('Error in GET /api/tenants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
