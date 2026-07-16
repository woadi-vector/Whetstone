import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";
import {
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

async function createValidatedResponse(
  systemPrompt: string,
  messages: z.infer<typeof requestSchema>["messages"],
) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const creativityAnswerCount = messages
    .slice(1)
    .filter((message) => message.role === "user").length;
  const completionNote = creativityAnswerCount >= 8
    ? "Respond with phase: reflecting now. Write the letter."
    : creativityAnswerCount >= 6
      ? "You have enough material. If a final short question is truly needed, ask exactly one more. Otherwise your next response must be phase: reflecting."
      : null;
  const conversation = messages
    .map(({ role, content }) => `${role === "assistant" ? "Assistant" : "User"}: ${content}`)
    .join("\n\n");
  const response = await openai.responses.create({
    model: "gpt-5.6",
    instructions: systemPrompt,
    input: [
      ...(completionNote ? [{ role: "system" as const, content: completionNote }] : []),
      {
        role: "user" as const,
        content: `Return only a valid JSON object.\n\nConversation history:\n${conversation}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  const data = discoveryResponseSchema.parse(parseModelJson(response.output_text));
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
    for (let attempt = 0; attempt < 2; attempt += 1) {
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
        if (attempt === 1) throw error;
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
