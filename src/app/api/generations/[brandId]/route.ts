import { NextResponse } from "next/server";
import { getGenerationHistory } from "@/lib/db/queries/generations";

// ---------------------------------------------------------------------------
// GET /api/generations/[brandId] - Get generation history for a brand
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // Fetch generation history with nested assets
    const generations = await getGenerationHistory(brandId, 50);

    return NextResponse.json(generations);
  } catch (error) {
    console.error("Error fetching generation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation history" },
      { status: 500 }
    );
  }
}
