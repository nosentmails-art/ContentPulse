import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getTemplate, getTemplateFilename } from '@/lib/templates';

/**
 * GET /api/[slug]/connect/template/[channel]
 * Download CSV template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string; channel: string } }
) {
  try {
    const slug = params.tenant;
    const { channel } = params;

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

    // Get template
    let template: string;
    try {
      template = getTemplate(channel as any);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid channel' },
        { status: 400 }
      );
    }

    // Get filename
    const filename = getTemplateFilename(channel as any);

    // Return CSV file with download header
    return new NextResponse(template, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/[tenant]/connect/template/[channel]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
