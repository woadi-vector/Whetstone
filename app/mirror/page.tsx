import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { mirrors } from "@/db/schema";
import { db } from "@/lib/db";
import { workshopMirrorSchema } from "@/lib/workshop";

const cardLabels = [
  ["themes", "Themes"],
  ["strengths", "Strengths"],
  ["interests", "Interests"],
  ["obsessions", "Obsessions"],
] as const;

export default async function MirrorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [mirror] = await db
    .select({ letter: mirrors.letter, cards: mirrors.cards })
    .from(mirrors)
    .where(eq(mirrors.userId, userId))
    .orderBy(desc(mirrors.createdAt))
    .limit(1);

  if (!mirror) {
    return <main className="mx-auto max-w-xl p-6 sm:pt-16"><p>Complete Discovery to create your Mirror.</p></main>;
  }

  const parsedMirror = workshopMirrorSchema.safeParse({ letter: mirror.letter, profile: mirror.cards });
  if (!parsedMirror.success) {
    return <main className="mx-auto max-w-xl p-6 sm:pt-16"><p>Your latest Mirror can't be displayed yet.</p></main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 p-6 sm:pt-16">
      <header><p className="text-sm text-stone-500">Mirror</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">This is what I'm hearing in you</h1></header>
      <blockquote className="border-l-4 border-amber-800 pl-4 text-lg leading-8 text-stone-800">{parsedMirror.data.letter}</blockquote>
      <section className="space-y-4">
        {cardLabels.map(([key, label]) => (
          <div key={key} className="rounded-lg border border-stone-200 p-4"><h2 className="font-medium">{label}</h2><p className="mt-2 text-sm text-stone-700">{parsedMirror.data.profile[key].join(" · ")}</p></div>
        ))}
        <div className="rounded-lg border border-stone-200 p-4"><h2 className="font-medium">Working style</h2><p className="mt-2 text-sm text-stone-700">{parsedMirror.data.profile.working_style}</p></div>
      </section>
      <section className="rounded-lg bg-amber-50 p-4"><p>Bring a rough idea or a decision you're wrestling with. This is a thinking partner that pushes back — not a coach, not a cheerleader.</p><Link className="mt-4 inline-block rounded bg-amber-800 px-4 py-2 text-white" href="/workshop">Try a Workshop</Link></section>
    </main>
  );
}
