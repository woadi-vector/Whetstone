import { z } from "zod";

const profileSchema = z.object({
  themes: z.array(z.string()).optional().default([]),
  strengths: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  obsessions: z.array(z.string()).optional().default([]),
  working_style: z.string().optional().default(""),
}).default({});

const interviewingSchema = z.object({
  message: z.string().min(1),
  phase: z.literal("interviewing"),
  profile: profileSchema,
});

const reflectingSchema = z.object({
  message: z.string().min(1),
  phase: z.literal("reflecting"),
  letter: z.string().min(1),
  profile: profileSchema,
});

export const discoveryResponseSchema = z.discriminatedUnion("phase", [
  interviewingSchema,
  reflectingSchema,
]);

export type DiscoveryResponse = z.infer<typeof discoveryResponseSchema>;

export function parseModelJson(raw: string): unknown {
  const withoutFences = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("The model did not return a JSON object.");
  }

  try {
    return JSON.parse(withoutFences.slice(start, end + 1));
  } catch {
    throw new Error("The model returned malformed JSON.");
  }
}
