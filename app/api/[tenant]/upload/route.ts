import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
  };
}

/**
 * POST /api/[tenant]/upload
 * Handle CSV/Excel file uploads and parse into ContentItem records
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug } = params;

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // TODO: Parse CSV/Excel file using parseUpload.ts
    // For now, return a placeholder response
    
    return NextResponse.json(
      {
        message: 'File upload received',
        fileName: file.name,
        size: file.size,
        itemsCreated: 0, // Will be populated after parsing
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[POST /api/[tenant]/upload] Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
