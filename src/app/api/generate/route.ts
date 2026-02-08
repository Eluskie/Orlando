import { NextRequest, NextResponse } from "next/server";
import { AI_CONFIG, isMockMode } from "@/lib/ai/config";
import { mockGenerateImages } from "@/lib/ai/mock";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";
import { buildStyledPrompt } from "@/lib/ai/prompt-builder";
import {
  createGeneration,
  updateGeneration,
  getDailyGenerationCount,
} from "@/lib/db/queries/generations";
import { db } from "@/lib/db";
import { brands, assets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadBuffer } from "@/lib/storage/r2";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive a client identifier from the request.
 * Uses X-Forwarded-For, falling back to a generic key for local dev.
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "local-dev";
}

// ---------------------------------------------------------------------------
// POST /api/generate - Generate images with brand style
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);

  // Rate limit check
  try {
    rateLimit(clientId, AI_CONFIG.rateLimit);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfter) },
        }
      );
    }
    throw error;
  }

  // Parse and validate request body
  let body: {
    prompt?: string;
    brandId?: string;
    count?: number;
    aspectRatio?: string;
    image?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    prompt,
    brandId,
    count = 4,
    aspectRatio = "1:1",
    image,
  } = body;

  // Validate required fields
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "prompt is required and must be a string" },
      { status: 400 }
    );
  }

  if (prompt.length > AI_CONFIG.generation.maxPromptLength) {
    return NextResponse.json(
      {
        error: `Prompt exceeds maximum length of ${AI_CONFIG.generation.maxPromptLength} characters`,
      },
      { status: 400 }
    );
  }

  if (!brandId || typeof brandId !== "string") {
    return NextResponse.json(
      { error: "brandId is required and must be a string" },
      { status: 400 }
    );
  }

  // Validate count (1-4)
  const validatedCount = Math.max(1, Math.min(count, 4));

  // Validate aspectRatio
  const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  if (!validAspectRatios.includes(aspectRatio)) {
    return NextResponse.json(
      {
        error: `Invalid aspectRatio. Must be one of: ${validAspectRatios.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    // Server-side daily limit check
    const dailyCount = await getDailyGenerationCount(brandId);
    if (dailyCount >= AI_CONFIG.generation.dailyLimit) {
      return NextResponse.json(
        {
          error: `Daily generation limit of ${AI_CONFIG.generation.dailyLimit} reached for this brand`,
        },
        { status: 429 }
      );
    }

    // Fetch brand to get style data
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Build styled prompt with brand style
    const styledPrompt = buildStyledPrompt(
      prompt,
      brand.style?.extractedStyle
    );

    // Create generation record (status: processing)
    const generation = await createGeneration({
      brandId,
      prompt,
      status: "processing",
      metadata: {
        model: isMockMode() ? "mock-multi-v1" : "imagen-4.0-generate-001",
        aspectRatio,
        styledPrompt,
        count: validatedCount,
        sourceImage: image ? "[provided]" : undefined,
      },
    });

    // MOCK PATH: Generate SVG placeholders
    if (isMockMode()) {
      const result = await mockGenerateImages(styledPrompt, validatedCount);

      // Create asset records with data URLs directly (no R2 upload in mock mode)
      const createdAssets = await Promise.all(
        result.images.map(async (img, i) => {
          const dataUrl = `data:image/svg+xml;base64,${img.base64}`;

          const [asset] = await db
            .insert(assets)
            .values({
              brandId,
              generationId: generation.id,
              url: dataUrl,
              name: `${prompt.slice(0, 50)} - Variation ${i + 1}`,
              type: "illustration",
              width: 512,
              height: 512,
            })
            .returning();

          return asset;
        })
      );

      // Update generation status to completed
      await updateGeneration(generation.id, {
        status: "completed",
        completedAt: new Date(),
      });

      return NextResponse.json({
        generationId: generation.id,
        assets: createdAssets,
        mode: "mock",
      });
    }

    // REAL PATH: Use Google Imagen 4 via AI SDK
    try {
      const { generateImage } = await import("ai");
      const { google } = await import("@ai-sdk/google");

      // Check if image input is provided for image-to-image generation
      let generatePrompt = styledPrompt;
      if (image) {
        // For image-to-image: prepend context to the prompt
        // Note: Full image-to-image with referenceImages would require direct API access
        // This is a graceful fallback that still uses brand style
        generatePrompt = `Based on the provided reference image: ${styledPrompt}`;
      }

      // Generate images using Imagen 4
      const result = await generateImage({
        model: google.image("imagen-4.0-generate-001"),
        prompt: generatePrompt,
        n: validatedCount,
        aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        providerOptions: {
          google: {
            personGeneration: "allow_adult",
          },
        },
      });

      // Upload each image to R2 and create asset records
      const createdAssets = await Promise.all(
        result.images.map(async (img, index) => {
          const buffer = Buffer.from(img.base64, "base64");
          const key = `brands/${brandId}/generated/${Date.now()}-gen-${generation.id}-${index}.png`;

          const url = await uploadBuffer(buffer, key, "image/png");

          const [asset] = await db
            .insert(assets)
            .values({
              brandId,
              generationId: generation.id,
              url,
              name: `${prompt.slice(0, 50)} - Variation ${index + 1}`,
              type: "illustration",
            })
            .returning();

          return asset;
        })
      );

      // Update generation to completed
      await updateGeneration(generation.id, {
        status: "completed",
        completedAt: new Date(),
      });

      return NextResponse.json({
        generationId: generation.id,
        assets: createdAssets,
      });
    } catch (aiError) {
      console.error("AI generation error:", aiError);

      // Update generation to failed
      await updateGeneration(generation.id, {
        status: "failed",
        errorMessage:
          aiError instanceof Error ? aiError.message : "Unknown error",
      });

      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation request failed" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/generate - Check rate limit status
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const status = rateLimit(clientId, AI_CONFIG.rateLimit);

  return NextResponse.json({
    rateLimit: {
      limited: false,
      remaining: status.remaining,
      resetsAt: new Date(status.resetAt).toISOString(),
    },
    config: {
      mockMode: isMockMode(),
      maxRequests: AI_CONFIG.rateLimit.maxRequests,
      windowMs: AI_CONFIG.rateLimit.windowMs,
      dailyLimit: AI_CONFIG.generation.dailyLimit,
    },
  });
}
