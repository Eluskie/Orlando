import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/brands/[brandId]/assets
 *
 * Fetch all assets belonging to a brand for the canvas workspace.
 * Returns assets with canvas positioning (canvasX, canvasY, canvasScale).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;

  try {
    const brandAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.brandId, brandId))
      .orderBy(assets.createdAt);

    return NextResponse.json(brandAssets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
