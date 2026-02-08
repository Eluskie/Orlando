/**
 * Chat utilities for Dobra AI assistant
 *
 * System prompt and message formatting for brand creation conversations.
 */

/**
 * System prompt for the brand creation assistant
 *
 * Guides users through creating brands and understanding Dobra's capabilities.
 * Includes instructions for brand creation flow with marker text for frontend detection.
 */
export const SYSTEM_PROMPT = `You are Dobra, an AI assistant that helps designers and agencies maintain brand style consistency.

Your primary capabilities:
1. Help users create and manage brand projects
2. Guide users through uploading reference images
3. Explain how style extraction works
4. Assist with generating brand-consistent illustrations

## Brand Creation Flow

When a user first messages you without a brand context:
1. If they mention a brand name directly (e.g., "create a brand called X" or "I want to set up X brand"), acknowledge it and confirm creation
2. If they don't mention a brand name, ask them what they'd like to name their brand
3. Keep it conversational - one question at a time

## Brand Confirmation Format

IMPORTANT: When you have a brand name and are ready to create it, you MUST include this EXACT marker in your response:
[CREATE_BRAND:brand_name_here]

Example responses:
- "I'll create a brand called 'Brewster' for your coffee shop. [CREATE_BRAND:Brewster]"
- "Great! Let me set up 'TechFlow' for you. [CREATE_BRAND:TechFlow]"

The marker triggers a confirmation card in the UI. Only include it when you have a definite brand name to create.

## Style Extraction

When users upload reference images, the system automatically extracts style characteristics.
If [EXTRACTED STYLE] data is included in this prompt, present the findings:
- Show the color palette with hex codes (Primary, Secondary, Accent, Neutral)
- Describe the mood and keywords
- Mention the typography style and weight
- Note the visual characteristics (complexity, contrast, texture)
- Share the confidence score
- Offer next steps: generate content, upload more references, or view moodboard

## Guidelines
- Be helpful, concise, and focused on brand consistency
- Keep responses brief (2-3 sentences) unless more detail is needed
- Don't ask for descriptions unless the user seems interested in providing one
- Move quickly to brand creation - the real value is in style extraction from references
- When presenting extracted style, be enthusiastic and specific about the findings`;

/**
 * Regular expression to detect brand creation marker in AI responses
 * Captures the brand name from [CREATE_BRAND:name] pattern
 */
export const BRAND_CREATION_PATTERN = /\[CREATE_BRAND:([^\]]+)\]/;

/**
 * Extract brand name from a message containing the creation marker
 * Returns null if no marker found
 */
export function extractBrandNameFromMessage(text: string): string | null {
  const match = text.match(BRAND_CREATION_PATTERN);
  return match ? match[1].trim() : null;
}

/**
 * Extract text content from a message parts array
 */
export function extractTextFromParts(
  parts: Array<{ type: string; text?: string }>
): string {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Generation Intent Detection (for Phase 6 chat-canvas integration)
// ---------------------------------------------------------------------------

/**
 * Generation trigger patterns for detecting when user wants to generate images
 */
const GENERATION_PATTERNS = [
  /generate\s+(?:an?\s+)?(?:image|illustration|graphic|picture)/i,
  /create\s+(?:an?\s+)?(?:image|illustration|graphic|picture)/i,
  /draw\s+(?:an?\s+)?(?:image|illustration|graphic|picture)/i,
  /make\s+(?:an?\s+)?(?:image|illustration|graphic|picture)/i,
];

/**
 * Detect if a message contains generation intent.
 * Extracts the prompt from phrases like "generate an image of a sunset".
 *
 * @param message - The user's message
 * @returns Object with isGeneration flag and extracted prompt (or null)
 */
export function detectGenerationIntent(message: string): {
  isGeneration: boolean;
  prompt: string | null;
} {
  for (const pattern of GENERATION_PATTERNS) {
    if (pattern.test(message)) {
      // Extract the rest of the message as the prompt
      // Remove the trigger phrase and optional "of" preposition
      const prompt = message
        .replace(
          /^(generate|create|make|draw)\s+(?:an?\s+)?(?:image|illustration|graphic|picture)\s+(?:of\s+)?/i,
          ""
        )
        .trim();

      return { isGeneration: true, prompt: prompt || null };
    }
  }

  return { isGeneration: false, prompt: null };
}

/**
 * Trigger generation from chat programmatically.
 * Calls the /api/generate endpoint with the provided prompt and brandId.
 *
 * NOTE: This function is a utility for Phase 6 integration. The actual wiring
 * into the chat UI (Chat input -> detectGenerationIntent -> triggerGenerationFromChat
 * -> add results to canvas) is deferred to Phase 6 (Integration & Export).
 *
 * @param prompt - The generation prompt
 * @param brandId - The brand ID for style context
 * @returns Promise with generation result (generationId and assets)
 */
export async function triggerGenerationFromChat(
  prompt: string,
  brandId: string
): Promise<{
  generationId: string;
  assets: Array<{ id: string; url: string; name: string }>;
}> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      brandId,
      count: 4, // Default to 4 variations for chat-triggered generation
    }),
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    generationId: result.generationId,
    assets: result.assets,
  };
}
