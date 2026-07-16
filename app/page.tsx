import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/discover");
  return <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl items-center px-5 pb-20 pt-10 sm:px-8 sm:pt-16"><section className="max-w-3xl"><p className="mb-7 text-sm font-medium uppercase tracking-[0.18em] text-clay">Whetstone</p><h1 className="font-display text-5xl leading-[0.98] tracking-tight text-ink sm:text-7xl">Anyone can change the world.<br />One idea at a time.</h1><p className="mt-8 max-w-2xl font-serif text-3xl leading-tight text-ink sm:text-4xl">Think of it as a personalized madlib that teaches you something about yourself.</p><p className="mt-8 max-w-2xl text-lg leading-8 text-muted-ink">A short conversation that reflects back where your creativity lives &mdash; then helps you shape an idea that&apos;s truly yours.</p><div className="mt-10 flex flex-wrap items-center gap-5"><Link href="/sign-in" className="rounded-full bg-clay px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-dark">Start</Link><Link href="/sign-in" className="text-sm font-medium text-ink underline decoration-clay underline-offset-4">Sign in</Link></div><div className="mt-5 space-y-1 text-sm text-muted-ink"><p>Free. Private to you. No email list, no catch.</p><p>Sign in just so your results save to you.</p></div></section></main>;
}
