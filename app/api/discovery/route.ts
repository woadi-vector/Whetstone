import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { discoveryResponseSchema, parseModelJson } from "@/lib/discovery";

export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(8_000),
});

async function loadDiscoveryPrompt() {
  return readFile(path.join(process.cwd(), "prompts", "discovery.md"), "utf8");
}

async function createValidatedResponse(systemPrompt: string, message: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: "gpt-5.6",
    instructions: systemPrompt,
    input: `Return only a valid JSON object.\n\nUser message:\n${message}`,
    text: { format: { type: "json_object" } },
  });

  return discoveryResponseSchema.parse(parseModelJson(response.output_text));
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const parsedRequest = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Enter a message before sending." }, { status: 400 });
  }

  try {
    const prompt = await loadDiscoveryPrompt();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const data = await createValidatedResponse(prompt, parsedRequest.data.message);
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
