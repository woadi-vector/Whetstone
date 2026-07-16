"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";
import { workshopMirrorSchema } from "@/lib/workshop";

const updateSchema = z.object({
  id: z.string().uuid(),
  profile: workshopMirrorSchema.shape.profile,
});

export async function updateMirrorCards(input: unknown) {
  const { userId } = await auth();
  if (!userId) return { error: "Sign in to save changes." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: "Those changes could not be saved." };

  try {
    await db.update(mirrors).set({ cards: parsed.data.profile }).where(and(eq(mirrors.id, parsed.data.id), eq(mirrors.userId, userId)));
    revalidatePath("/mirror");
    revalidatePath("/archive");
    return { ok: true };
  } catch (error) {
    console.error("Saving Mirror edits failed", error);
    return { error: "Those changes could not be saved. Please try again." };
  }
}
