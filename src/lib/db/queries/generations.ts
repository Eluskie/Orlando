import { db } from "@/lib/db";
import { generations, assets } from "@/lib/db/schema";
import { eq, desc, gte, sql, and } from "drizzle-orm";
import type { GenerationStatus, GenerationMetadata } from "@/types/generation";

/**
 * Create a new generation record in the database
 */
export async function createGeneration(data: {
  brandId: string;
  prompt: string;
  status?: GenerationStatus;
  metadata?: GenerationMetadata;
  conversationId?: string;
}) {
  const [generation] = await db
    .insert(generations)
    .values({
      brandId: data.brandId,
      prompt: data.prompt,
      status: data.status ?? "pending",
      metadata: data.metadata ?? {},
      conversationId: data.conversationId,
    })
    .returning();

  return generation;
}

/**
 * Update an existing generation record
 */
export async function updateGeneration(
  id: string,
  data: Partial<{
    status: GenerationStatus;
    completedAt: Date;
    errorMessage: string;
  }>
) {
  const [updated] = await db
    .update(generations)
    .set(data)
    .where(eq(generations.id, id))
    .returning();

  return updated;
}

/**
 * Get generation history for a brand, with nested assets
 */
export async function getGenerationHistory(brandId: string, limit = 50) {
  return db.query.generations.findMany({
    where: eq(generations.brandId, brandId),
    orderBy: [desc(generations.createdAt)],
    limit,
    with: {
      assets: true,
    },
  });
}

/**
 * Get a single generation by ID, with nested assets
 */
export async function getGeneration(id: string) {
  return db.query.generations.findFirst({
    where: eq(generations.id, id),
    with: {
      assets: true,
    },
  });
}

/**
 * Get the count of generations created today for a specific brand
 * Used for server-side daily rate limiting
 */
export async function getDailyGenerationCount(brandId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generations)
    .where(
      and(
        eq(generations.brandId, brandId),
        gte(generations.createdAt, sql`CURRENT_DATE`)
      )
    );

  return result[0]?.count ?? 0;
}
