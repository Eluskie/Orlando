import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { isMockMode } from "@/lib/ai/config";
import { mockChat } from "@/lib/ai/mock";
import { SYSTEM_PROMPT, extractTextFromParts } from "@/lib/ai/chat";
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema";
import {
  extractStyleFromImages,
  mockExtractStyle,
  type ExtractedStyle,
} from "@/lib/ai/style-extraction";

/**
 * Extract image URLs from message parts
 */
function extractImageUrls(messages: UIMessage[]): string[] {
  const urls: string[] = [];
  for (const msg of messages) {
    if (msg.parts) {
      for (const part of msg.parts) {
        if (
          part.type === "file" &&
          "mediaType" in part &&
          typeof part.mediaType === "string" &&
          part.mediaType.startsWith("image/") &&
          "url" in part &&
          typeof part.url === "string"
        ) {
          urls.push(part.url);
        }
      }
    }
  }
  return urls;
}

/**
 * POST /api/chat
 *
 * Streaming chat endpoint supporting both mock and real AI modes.
 * Returns streaming response using Vercel AI SDK protocol.
 * Persists messages to database when conversationId is provided.
 * Extracts style from images and persists to brand.
 */
export async function POST(req: Request) {
  console.log("[CHAT API] Request received");
  try {
    const body = await req.json();
    console.log("[CHAT API] Body:", JSON.stringify(body, null, 2));
    const { messages, conversationId, brandId } = body as {
      messages: UIMessage[];
      brandId?: string;
      conversationId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      console.log("[CHAT API] Error: Messages array missing");
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      "[CHAT API] Messages count:",
      messages.length,
      "Mock mode:",
      isMockMode(),
      "Brand ID:",
      brandId
    );

    // Check for images in the latest user message
    const imageUrls = extractImageUrls(messages);
    let extractedStyle: ExtractedStyle | null = null;

    if (imageUrls.length > 0) {
      console.log("[CHAT API] Found images:", imageUrls.length);
      try {
        // Extract style from images
        extractedStyle = isMockMode()
          ? mockExtractStyle()
          : await extractStyleFromImages(imageUrls);
        console.log("[CHAT API] Style extracted:", extractedStyle);
      } catch (error) {
        console.error("[CHAT API] Style extraction failed:", error);
        // Continue without style extraction
      }
    }

    // Persist extracted style to brand database if we have both style and brandId
    if (extractedStyle && brandId) {
      try {
        const stylePayload = {
          extractedStyle: {
            ...extractedStyle,
            extractedAt: new Date().toISOString(),
            sourceImages: imageUrls,
          },
          referenceImages: imageUrls,
        };

        // Call the style persistence endpoint
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");

        const styleResponse = await fetch(
          `${baseUrl}/api/brands/${brandId}/style`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stylePayload),
          }
        );

        if (!styleResponse.ok) {
          console.error(
            "[CHAT API] Style persistence failed:",
            await styleResponse.text()
          );
        } else {
          console.log("[CHAT API] Style persisted to brand");
        }
      } catch (error) {
        console.error("[CHAT API] Failed to persist extracted style:", error);
        // Don't fail the chat request, just log the error
      }
    }

    // Build system prompt with extraction context if available
    const systemWithContext = extractedStyle
      ? `${SYSTEM_PROMPT}

[EXTRACTED STYLE]
${JSON.stringify(extractedStyle, null, 2)}

You just analyzed ${imageUrls.length} reference image(s) and extracted the style above. Present these findings to the user:
- Show the color palette with hex codes
- Describe the mood and keywords
- Mention the typography style
- Note the visual characteristics
- Offer next steps (generate content, upload more references, view moodboard)`
      : SYSTEM_PROMPT;

    // Mock mode: simulate streaming with delays
    if (isMockMode()) {
      console.log("[CHAT API] Using mock mode");
      return createMockStreamResponse(
        messages,
        conversationId,
        extractedStyle,
        imageUrls
      );
    }

    // Real mode: use Gemini via AI SDK
    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemWithContext,
      messages: await convertToModelMessages(messages),
    });

    // Consume stream to ensure onFinish fires even if client disconnects
    // Per RESEARCH.md pitfall #3 - call without await
    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finalMessages }) => {
        // Skip persistence if no conversationId provided (new chat flow)
        if (!conversationId) return;

        try {
          // Get the last 2 messages (user + assistant)
          const newMessages = finalMessages.slice(-2);

          // Persist to database
          await db.insert(messagesTable).values(
            newMessages.map((m) => ({
              conversationId,
              role: m.role as "user" | "assistant" | "system",
              content: m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join(""),
            }))
          );
        } catch (error) {
          console.error("Failed to persist messages:", error);
        }
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Create a mock streaming response
 *
 * Simulates word-by-word streaming with delays for realistic UX.
 * Also persists messages when conversationId is provided.
 */
async function createMockStreamResponse(
  messages: UIMessage[],
  conversationId?: string,
  extractedStyle?: ExtractedStyle | null,
  imageUrls?: string[]
): Promise<Response> {
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userText =
    lastMessage?.role === "user" && lastMessage.parts
      ? extractTextFromParts(
          lastMessage.parts as Array<{ type: string; text?: string }>
        )
      : "";

  // If we have extracted style, create a style extraction response
  let mockResponse: { id: string; role: "assistant"; content: string };

  if (extractedStyle && imageUrls && imageUrls.length > 0) {
    // Format style extraction response
    const { colors, mood, typography, visualStyle, confidence } =
      extractedStyle;

    mockResponse = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `I've analyzed your ${imageUrls.length} reference image${imageUrls.length > 1 ? "s" : ""} and extracted the following style characteristics:

**Color Palette:**
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}
- Neutral: ${colors.neutral}

**Mood & Keywords:**
${mood.primary} - ${mood.keywords.join(", ")}
Temperature: ${mood.tone}

**Typography:** ${typography.style}, ${typography.weight} weight with a ${typography.mood} feel

**Visual Style:**
- Complexity: ${visualStyle.complexity}
- Contrast: ${visualStyle.contrast}
- Texture: ${visualStyle.texture}

Confidence: ${Math.round(confidence * 100)}%

This style profile has been saved to your brand. You can now:
1. Generate illustrations using this style
2. Upload additional references to refine the style
3. View your brand's moodboard

What would you like to do next?`,
    };
  } else {
    // Get regular mock response
    mockResponse = await mockChat(userText);
  }

  // Persist messages to database if conversationId provided
  if (conversationId) {
    try {
      // Save the user message
      if (lastMessage?.role === "user") {
        await db.insert(messagesTable).values({
          conversationId,
          role: "user",
          content: userText,
        });
      }

      // Save the assistant response
      await db.insert(messagesTable).values({
        conversationId,
        role: "assistant",
        content: mockResponse.content,
      });
    } catch (error) {
      console.error("Failed to persist mock messages:", error);
    }
  }

  // Create streaming response with word-by-word chunks
  // Using AI SDK data stream protocol
  const encoder = new TextEncoder();
  const words = mockResponse.content.split(" ");

  const stream = new ReadableStream({
    async start(controller) {
      // Stream words with delays - text delta format: 0:"text"
      for (let i = 0; i < words.length; i++) {
        const word = i === 0 ? words[i] : " " + words[i];
        controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));

        // Add delay between words (30ms for natural feel)
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      // Send finish message with metadata
      controller.enqueue(
        encoder.encode(
          `e:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 10, completionTokens: words.length } })}\n`
        )
      );

      // Send done signal
      controller.enqueue(
        encoder.encode(`d:${JSON.stringify({ finishReason: "stop" })}\n`)
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
