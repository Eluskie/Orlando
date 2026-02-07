import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * GET /api/conversations/[conversationId]/messages
 *
 * Returns all messages for a conversation in UIMessage format
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    // Check if conversation exists
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get all messages for the conversation
    const dbMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    // Transform to UIMessage format
    const uiMessages = dbMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: msg.content }],
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({ messages: uiMessages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[conversationId]/messages
 *
 * Clears all messages for a conversation (keeps the conversation record)
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    // Check if conversation exists
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Delete all messages for the conversation
    await db.delete(messages).where(eq(messages.conversationId, conversationId));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to clear messages:", error);
    return NextResponse.json(
      { error: "Failed to clear messages" },
      { status: 500 }
    );
  }
}
