import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { z } from "zod";
import { parseModelJson } from "@/lib/discovery";

const mirrorProfileSchema = z.object({
  themes: z.array(z.string()),
  strengths: z.array(z.string()),
  interests: z.array(z.string()),
  obsessions: z.array(z.string()),
  working_style: z.string(),
});

export const workshopMirrorSchema = z.object({
  letter: z.string().min(1),
  profile: mirrorProfileSchema,
});

const challengingResponseSchema = z.object({
  reply: z.string().min(1),
  mirror_anchor: z.string().min(1),
  phase: z.literal("challenging"),
});

const closingResponseSchema = z.object({
  reply: z.string().min(1),
  mirror_anchor: z.string(),
  phase: z.literal("closing"),
});

export const workshopResponseSchema = z.discriminatedUnion("phase", [
  challengingResponseSchema,
  closingResponseSchema,
]);

export type WorkshopMirror = z.infer<typeof workshopMirrorSchema>;
export type WorkshopResponse = z.infer<typeof workshopResponseSchema>;
export type WorkshopChatMessage = {
  role: "assistant" | "user";
  content: string;
};

async function loadWorkshopPrompt() {
  return readFile(path.join(process.cwd(), "prompts", "workshop.md"), "utf8");
}

export async function createWorkshopResponse(
  mirror: WorkshopMirror,
  messages: WorkshopChatMessage[],
): Promise<WorkshopResponse> {
  const prompt = await loadWorkshopPrompt();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const userAnswerCount = messages.filter((message) => message.role === "user").length;
  const completionNote = userAnswerCount >= 4
    ? "Respond with phase: closing now. Write the 2-3 sentence what-I-heard close."
    : userAnswerCount >= 3
      ? "You have enough material. If one final short question is truly needed, ask exactly one more. Otherwise your next response must be phase: closing."
      : null;
  const conversation = messages
    .map(({ role, content }) => `${role === "assistant" ? "Assistant" : "User"}: ${content}`)
    .join("\n\n");
  const response = await openai.responses.create({
    model: "gpt-5.6",
    instructions: prompt,
    input: [
      ...(completionNote ? [{ role: "system" as const, content: completionNote }] : []),
      {
        role: "user" as const,
        content: `Return only a valid JSON object.\n\nMirror:\n${JSON.stringify(mirror)}\n\nWorkshop conversation:\n${conversation}`,
      },
    ],
    text: { format: { type: "json_object" } },
  });

  const data = workshopResponseSchema.parse(parseModelJson(response.output_text));
  if (userAnswerCount === 1 && data.phase !== "challenging") {
    throw new Error("Workshop must challenge on its first response.");
  }
  if (userAnswerCount >= 4 && data.phase !== "closing") {
    throw new Error("Workshop must close after four user exchanges.");
  }

  return data;
}
