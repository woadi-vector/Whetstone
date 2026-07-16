import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function SiteNav() {
  const { userId } = await auth();

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8" aria-label="Main navigation">
      <Link className="font-display text-2xl tracking-tight text-ink" href={userId ? "/discover" : "/"}>Whetstone</Link>
      {userId ? (
        <div className="flex items-center gap-4 text-sm text-muted-ink sm:gap-6">
          <Link className="transition-colors hover:text-clay" href="/discover">Discover</Link>
          <Link className="transition-colors hover:text-clay" href="/workshop">Workshop</Link>
          <Link className="transition-colors hover:text-clay" href="/mirror">Mirror</Link>
          <SignOutButton redirectUrl="/"><button className="transition-colors hover:text-clay">Sign out</button></SignOutButton>
        </div>
      ) : null}
    </nav>
  );
}
