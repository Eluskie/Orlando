import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { ExtractedStyleData, BrandStyle } from '@/types/brand';

interface StyleUpdateBody {
  extractedStyle: ExtractedStyleData;
  referenceImages: string[];
}

/**
 * PATCH /api/brands/[brandId]/style
 *
 * Updates a brand's style with extracted style data and reference images.
 * Merges with existing style rather than replacing.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const body: StyleUpdateBody = await request.json();

    // Get current brand
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const currentStyle = (brand.style || {}) as BrandStyle;

    // Merge with existing style
    const updatedStyle: BrandStyle = {
      ...currentStyle,
      extractedStyle: {
        ...body.extractedStyle,
        extractedAt: new Date().toISOString(),
        sourceImages: body.referenceImages,
      },
      referenceImages: [
        ...(currentStyle.referenceImages || []),
        ...body.referenceImages.filter(
          (url) => !currentStyle.referenceImages?.includes(url)
        ),
      ],
      // Also populate top-level colors from extraction
      primaryColor: body.extractedStyle.colors.primary,
      secondaryColor: body.extractedStyle.colors.secondary,
      accentColor: body.extractedStyle.colors.accent,
      keywords: body.extractedStyle.mood.keywords,
      tone: body.extractedStyle.mood.primary,
    };

    // Update brand
    await db
      .update(brands)
      .set({
        style: updatedStyle,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, brandId));

    return NextResponse.json({ success: true, style: updatedStyle });
  } catch (error) {
    console.error('Style update error:', error);
    return NextResponse.json(
      { error: 'Failed to update style' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/brands/[brandId]/style
 *
 * Returns a brand's current style data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ style: brand.style || {} });
  } catch (error) {
    console.error('Style fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch style' },
      { status: 500 }
    );
  }
}
