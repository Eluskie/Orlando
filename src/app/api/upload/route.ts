import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * POST /api/upload
 *
 * Upload a file to Vercel Blob storage.
 * Accepts FormData with:
 * - file: The file to upload
 * - brandId: Optional brand ID for organizing uploads
 *
 * Returns: { url: string, pathname: string }
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const brandId = formData.get('brandId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Use generic path if no brandId (new brand flow)
    const path = brandId
      ? `brands/${brandId}/references/${file.name}`
      : `temp/references/${file.name}`;

    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
