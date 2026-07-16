import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";
import {
  creativityOpenerMessage,
  discoveryResponseSchema,
  moodCheckMessage,
  parseModelJson,
} from "@/lib/discovery";

export const runtime = "nodejs";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["assistant", "user"]),
    content: z.string().trim().min(1).max(8_000),
  })).min(2).max(16),
});

async function loadDiscoveryPrompt() {
  return readFile(path.join(process.cwd(), "prompts", "discovery.md"), "utf8");
}

const moodPivotSystemNote = "The user just told you their current mood. Your entire message must be exactly two parts: first, ONE short sentence acknowledging what they said — warm, specific to their words, no advice, no sympathy performance, and absolutely NO question about the mood; second, this question verbatim: 'Before we go anywhere, I'd love to get to know you a little. There's no wrong answer to any of this. What's something you can lose track of time doing — even if it feels small or silly?' Return the standard interviewing JSON with both parts as one message.";

function isValidDiscoveryHistory(messages: z.infer<typeof requestSchema>["messages"]) {
  if (
    messages[0]?.role !== "assistant" ||
    messages[0].content !== moodCheckMessage ||
    messages[1]?.role !== "user"
  ) {
    return false;
  }

  return messages.every((message, index) =>
    message.role === (index % 2 === 0 ? "assistant" : "user"),
  );
}

function isValidMoodPivotResponse(data: z.infer<typeof discoveryResponseSchema>) {
  if (data.phase !== "interviewing" || !data.message.endsWith(creativityOpenerMessage)) {
    return false;
  }

  const acknowledgment = data.message.slice(0, -creativityOpenerMessage.length).trim();
  return acknowledgment.length > 0 && acknowledgment.length <= 240 &&
    acknowledgment.split(/[.!?]+/).filter(Boolean).length === 1;
}

async function createValidatedResponse(
  systemPrompt: string,
  messages: z.infer<typeof requestSchema>["messages"],
) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const isMoodPivot = messages.length === 2;
  const creativityAnswerCount = messages
    .slice(3)
    .filter((message) => message.role === "user").length;
  const completionNote = creativityAnswerCount >= 8
    ? "Respond with phase: reflecting now. Write the letter."
    : creativityAnswerCount >= 6
      ? "You have enough material. If a final short question is truly needed, ask exactly one more. Otherwise your next response must be phase: reflecting."
      : null;
  const systemNotes = [
    ...(isMoodPivot ? [moodPivotSystemNote] : []),
    ...(completionNote ? [completionNote] : []),
  ];
  const conversation = messages
    .map(({ role, content }) => `${role === "assistant" ? "Assistant" : "User"}: ${content}`)
    .join("\n\n");
  const response = await openai.responses.create({
    model: "gpt-5.6",
    instructions: systemPrompt,
    input: [
      ...systemNotes.map((content) => ({ role: "system" as const, content })),
      {
        role: "user" as const,
        content: `Return only a valid JSON object.\n\nConversation history:\n${conversation}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  const data = discoveryResponseSchema.parse(parseModelJson(response.output_text));
  if (isMoodPivot && !isValidMoodPivotResponse(data)) {
    throw new Error("Mood pivot did not include the required acknowledgment and creativity question.");
  }
  if (creativityAnswerCount >= 8 && data.phase !== "reflecting") {
    throw new Error("Discovery must reflect after eight creativity answers.");
  }

  return data;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const parsedRequest = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Send a complete discovery response." }, { status: 400 });
  }

  if (!isValidDiscoveryHistory(parsedRequest.data.messages)) {
    return NextResponse.json({ error: "Start with the discovery questions." }, { status: 400 });
  }

  try {
    const prompt = await loadDiscoveryPrompt();
    const attempts = parsedRequest.data.messages.length === 2 ? 1 : 2;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const data = await createValidatedResponse(prompt, parsedRequest.data.messages);
        if (data.phase === "reflecting") {
          try {
            await db.insert(mirrors).values({
              userId,
              moodRaw: parsedRequest.data.messages[1].content,
              transcript: parsedRequest.data.messages,
              letter: data.letter,
              cards: data.profile,
            });
          } catch (error) {
            console.error("Saving Mirror failed", error);
            return NextResponse.json(
              { error: "We couldn't save your Mirror. Please try again." },
              { status: 503 },
            );
          }
        }
        return NextResponse.json(data);
      } catch (error) {
        if (attempt === attempts - 1) throw error;
      }
    }
  } catch (error) {
    console.error("Discovery route failed", error);
    return NextResponse.json(
      { error: "I couldn’t form a complete response just then. Please try again." },
      { status: 502 },
    );
  }
}
