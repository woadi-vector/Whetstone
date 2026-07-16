import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";

function firstLine(letter: string) {
  return letter.split(/\r?\n|(?<=[.!?])\s/)[0] || letter;
}

function formattedDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(value);
}

export default async function ArchivePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  try {
    const entries = await db.select({ id: mirrors.id, moodRaw: mirrors.moodRaw, letter: mirrors.letter, createdAt: mirrors.createdAt }).from(mirrors).where(eq(mirrors.userId, userId)).orderBy(desc(mirrors.createdAt));
    return <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-8 sm:px-8 sm:pt-14"><header><p className="text-sm font-medium uppercase tracking-[0.16em] text-clay">Archive</p><h1 className="mt-4 font-display text-5xl leading-none text-ink sm:text-6xl">Your Mirrors</h1></header><section className="mt-10 divide-y divide-line border-y border-line">{entries.length ? entries.map((entry) => <Link key={entry.id} href={`/mirror?id=${entry.id}`} className="block py-6 transition-colors hover:text-clay"><div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-ink"><span>{formattedDate(entry.createdAt)}</span><span aria-hidden="true">&middot;</span><span>{entry.moodRaw}</span></div><p className="mt-3 font-serif text-2xl leading-8 text-ink">{firstLine(entry.letter)}</p></Link>) : <div className="py-10"><p className="text-muted-ink">Your Mirror will appear here.</p><Link href="/discover" className="mt-4 inline-block text-clay underline underline-offset-4">Discover</Link></div>}</section></main>;
  } catch (error) {
    console.error("Loading Archive failed", error);
    return <main className="mx-auto max-w-xl px-5 py-20 text-muted-ink">We couldn&apos;t load your Archive. Please try again.</main>;
  }
}
