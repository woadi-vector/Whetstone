import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import MirrorView from "@/components/mirror-view";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";
import { workshopMirrorSchema } from "@/lib/workshop";

export default async function MirrorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await searchParams;
  const requestedId = id ? z.string().uuid().safeParse(id) : null;

  try {
    const [mirror] = await db
      .select({ id: mirrors.id, moodRaw: mirrors.moodRaw, letter: mirrors.letter, cards: mirrors.cards, createdAt: mirrors.createdAt })
      .from(mirrors)
      .where(requestedId?.success ? and(eq(mirrors.userId, userId), eq(mirrors.id, requestedId.data)) : eq(mirrors.userId, userId))
      .orderBy(desc(mirrors.createdAt))
      .limit(1);

    if (!mirror || (id && !requestedId?.success)) return <EmptyMirror />;
    const parsed = workshopMirrorSchema.safeParse({ letter: mirror.letter, profile: mirror.cards });
    if (!parsed.success) return <main className="mx-auto max-w-xl px-5 py-20 text-muted-ink">Your latest Mirror can&apos;t be displayed yet.</main>;
    return <MirrorView mirror={{ id: mirror.id, moodRaw: mirror.moodRaw, letter: parsed.data.letter, profile: parsed.data.profile, createdAt: mirror.createdAt.toISOString() }} />;
  } catch (error) {
    console.error("Loading Mirror failed", error);
    return <main className="mx-auto max-w-xl px-5 py-20 text-muted-ink">We couldn&apos;t load your Mirror. Please try again.</main>;
  }
}

function EmptyMirror() {
  return <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-xl flex-col justify-center px-5"><p className="text-sm font-medium uppercase tracking-[0.16em] text-clay">Mirror</p><h1 className="mt-4 font-display text-5xl leading-none text-ink">Your Mirror will appear here.</h1><p className="mt-5 text-muted-ink">Start with Discovery to create it.</p><Link href="/discover" className="mt-8 w-fit rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">Discover</Link></main>;
}
