import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { isMockMode } from "@/lib/ai/config";
import { mockChat } from "@/lib/ai/mock";
import { SYSTEM_PROMPT, extractTextFromParts } from "@/lib/ai/chat";
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema";

/**
 * POST /api/chat
 *
 * Streaming chat endpoint supporting both mock and real AI modes.
 * Returns streaming response using Vercel AI SDK protocol.
 * Persists messages to database when conversationId is provided.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, conversationId } = body as {
      messages: UIMessage[];
      brandId?: string;
      conversationId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mock mode: simulate streaming with delays
    if (isMockMode()) {
      return createMockStreamResponse(messages, conversationId);
    }

    // Real mode: use Gemini via AI SDK
    const result = streamText({
      model: google("gemini-1.5-pro"),
      system: SYSTEM_PROMPT,
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
  conversationId?: string
): Promise<Response> {
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userText =
    lastMessage?.role === "user" && lastMessage.parts
      ? extractTextFromParts(lastMessage.parts as Array<{ type: string; text?: string }>)
      : "";

  // Get mock response
  const mockResponse = await mockChat(userText);

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
  const encoder = new TextEncoder();
  const words = mockResponse.content.split(" ");

  const stream = new ReadableStream({
    async start(controller) {
      // Send message start
      controller.enqueue(
        encoder.encode(`0:${JSON.stringify({ id: mockResponse.id })}\n`)
      );

      // Stream words with delays
      for (let i = 0; i < words.length; i++) {
        const word = i === 0 ? words[i] : " " + words[i];
        const chunk = `0:${JSON.stringify(word)}\n`;
        controller.enqueue(encoder.encode(chunk));

        // Add delay between words (50ms for natural feel)
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Send finish signal
      controller.enqueue(
        encoder.encode(
          `d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`
        )
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
