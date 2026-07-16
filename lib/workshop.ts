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

async function loadWorkshopPrompt() {
  return readFile(path.join(process.cwd(), "prompts", "workshop.md"), "utf8");
}

export async function createWorkshopFirstResponse(
  mirror: WorkshopMirror,
  idea: string,
): Promise<WorkshopResponse> {
  const prompt = await loadWorkshopPrompt();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: "gpt-5.6",
    instructions: prompt,
    input: `Return only a valid JSON object.\n\nMirror:\n${JSON.stringify(mirror)}\n\nRaw idea:\n${idea}`,
    text: { format: { type: "json_object" } },
  });

  return workshopResponseSchema.parse(parseModelJson(response.output_text));
}
