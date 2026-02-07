import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brands, conversations } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

/**
 * GET /api/brands
 *
 * Returns all brands ordered by creation date (newest first)
 */
export async function GET() {
  try {
    const allBrands = await db
      .select()
      .from(brands)
      .orderBy(desc(brands.createdAt));

    return NextResponse.json({ brands: allBrands });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands
 *
 * Creates a new brand with an associated default conversation
 * Request body: { name: string, description?: string }
 * Returns: { brand, conversationId }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body as {
      name: string;
      description?: string;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Create the brand
    const [newBrand] = await db
      .insert(brands)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        style: {},
      })
      .returning();

    // Create default conversation for the brand
    const [conversation] = await db
      .insert(conversations)
      .values({
        brandId: newBrand.id,
        title: `${name.trim()} Chat`,
      })
      .returning();

    return NextResponse.json({
      brand: newBrand,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Failed to create brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
