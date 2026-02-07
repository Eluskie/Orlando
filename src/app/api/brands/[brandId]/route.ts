import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brands, conversations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/brands/[brandId]
 *
 * Returns a single brand with its default conversation
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    // Get brand
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId))
      .limit(1);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Get the latest conversation for this brand
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.brandId, brandId))
      .orderBy(desc(conversations.createdAt))
      .limit(1);

    return NextResponse.json({
      brand,
      conversationId: conversation?.id ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
