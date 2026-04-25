import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a professional, empathetic customer support agent. Your responsibilities:

- Provide clear, accurate, and helpful answers to customer questions
- Be concise but thorough — answer directly without filler phrases
- Maintain a warm, professional tone at all times
- Use short paragraphs for readability; avoid walls of text
- If you don't know specific account details, order numbers, or proprietary policies, acknowledge this honestly and guide the customer to contact a human agent
- Never fabricate specific information like prices, dates, or policies

Format: plain text only, no markdown. Keep responses under 150 words unless the question genuinely requires more detail.`;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { message, history } = body as {
      message: string;
      history: Message[];
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message.trim() },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "Failed to get a response. Please try again." },
      { status: 500 }
    );
  }
}
