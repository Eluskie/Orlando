import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { isMockMode } from "@/lib/ai/config";
import { mockChat } from "@/lib/ai/mock";
import { SYSTEM_PROMPT, extractTextFromParts } from "@/lib/ai/chat";

/**
 * POST /api/chat
 *
 * Streaming chat endpoint supporting both mock and real AI modes.
 * Returns streaming response using Vercel AI SDK protocol.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as {
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
      return createMockStreamResponse(messages);
    }

    // Real mode: use Gemini via AI SDK
    const result = streamText({
      model: google("gemini-1.5-pro"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
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
 */
async function createMockStreamResponse(
  messages: UIMessage[]
): Promise<Response> {
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userText =
    lastMessage?.role === "user" && lastMessage.parts
      ? extractTextFromParts(lastMessage.parts as Array<{ type: string; text?: string }>)
      : "";

  // Get mock response
  const mockResponse = await mockChat(userText);

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
