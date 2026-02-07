import { NextRequest, NextResponse } from "next/server";
import { AI_CONFIG, isMockMode } from "@/lib/ai/config";
import { mockGenerate } from "@/lib/ai/mock";
import { rateLimit, checkRateLimit, RateLimitError } from "@/lib/rate-limit";

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
// POST /api/generate - Generate an image
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
        },
      );
    }
    throw error;
  }

  // Parse and validate request body
  let body: { prompt?: string; brandId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { prompt, brandId } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "prompt is required and must be a string" },
      { status: 400 },
    );
  }

  if (prompt.length > AI_CONFIG.generation.maxPromptLength) {
    return NextResponse.json(
      {
        error: `Prompt exceeds maximum length of ${AI_CONFIG.generation.maxPromptLength} characters`,
      },
      { status: 400 },
    );
  }

  if (!brandId || typeof brandId !== "string") {
    return NextResponse.json(
      { error: "brandId is required and must be a string" },
      { status: 400 },
    );
  }

  // Generate (mock or real)
  if (isMockMode()) {
    const result = await mockGenerate(prompt);
    return NextResponse.json({
      success: true,
      mode: "mock",
      generation: {
        id: result.id,
        brandId,
        prompt: result.prompt,
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
        model: result.model,
        seed: result.seed,
        status: "completed",
      },
    });
  }

  // Real AI generation - placeholder for Phase 5
  return NextResponse.json(
    {
      error:
        "Real AI generation not yet implemented. Set MOCK_AI_MODE=true for development.",
    },
    { status: 501 },
  );
}

// ---------------------------------------------------------------------------
// GET /api/generate - Check rate limit status
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const status = checkRateLimit(clientId, AI_CONFIG.rateLimit);

  return NextResponse.json({
    rateLimit: {
      limited: status.limited,
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
