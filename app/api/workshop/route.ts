import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";
import {
  createWorkshopResponse,
  workshopMirrorSchema,
} from "@/lib/workshop";

export const runtime = "nodejs";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["assistant", "user"]),
    content: z.string().trim().min(1).max(8_000),
  })).min(1).max(8),
});

function isValidWorkshopHistory(messages: z.infer<typeof requestSchema>["messages"]) {
  return messages[0]?.role === "user" && messages.every((message, index) =>
    message.role === (index % 2 === 0 ? "user" : "assistant"),
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const parsedRequest = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success || !isValidWorkshopHistory(parsedRequest.data.messages)) {
    return NextResponse.json({ error: "Send a complete Workshop response." }, { status: 400 });
  }

  let latestMirror: { letter: string; cards: unknown } | undefined;
  try {
    [latestMirror] = await db
      .select({ letter: mirrors.letter, cards: mirrors.cards })
      .from(mirrors)
      .where(eq(mirrors.userId, userId))
      .orderBy(desc(mirrors.createdAt))
      .limit(1);
  } catch (error) {
    console.error("Loading latest Mirror failed", error);
    return NextResponse.json({ error: "We couldn't load your Mirror. Please try again." }, { status: 503 });
  }

  if (!latestMirror) {
    return NextResponse.json({ error: "Complete Discovery before starting a Workshop." }, { status: 400 });
  }

  const mirror = workshopMirrorSchema.safeParse({
    letter: latestMirror.letter,
    profile: latestMirror.cards,
  });
  if (!mirror.success) {
    console.error("Latest Mirror has an invalid Workshop shape", mirror.error);
    return NextResponse.json({ error: "Your latest Mirror can't start a Workshop yet." }, { status: 500 });
  }

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const data = await createWorkshopResponse(mirror.data, parsedRequest.data.messages);
        return NextResponse.json(data);
      } catch (error) {
        if (attempt === 1) throw error;
      }
    }
  } catch (error) {
    console.error("Workshop route failed", error);
    return NextResponse.json(
      { error: "I couldn't form a complete response just then. Please try again." },
      { status: 502 },
    );
  }
}
