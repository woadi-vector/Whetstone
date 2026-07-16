"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import Link from "next/link";
import { moodCheckMessage, type DiscoveryChatMessage, type DiscoveryResponse } from "@/lib/discovery";

export default function DiscoveryTest() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [conversation, setConversation] = useState<DiscoveryChatMessage[]>([{ role: "assistant", content: moodCheckMessage }]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitDiscovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);
    const previousConversation = conversation;
    const nextConversation = [...conversation, { role: "user" as const, content: message }];
    setConversation(nextConversation);
    setMessage("");
    try {
      const response = await fetch("/api/discovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextConversation }) });
      const body: DiscoveryResponse | { error: string } = await response.json();
      if ("error" in body) throw new Error(body.error);
      if (!response.ok) throw new Error("Discovery failed.");
      setResult(body);
      setConversation([...nextConversation, { role: "assistant", content: body.message }]);
    } catch (caught) {
      setConversation(previousConversation);
      setError(caught instanceof Error ? caught.message : "Discovery failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetDiscovery() {
    setMessage("");
    setResult(null);
    setError("");
    setConversation([{ role: "assistant", content: moodCheckMessage }]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
      <header className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-clay">{"Stage 1 \u00b7 Discovery"}</p>
        <h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">Where does your creativity live?</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-ink">A short, easy conversation. No right answers. After a few exchanges I&apos;ll reflect what I&apos;m hearing back to you.</p>
      </header>
      <section className="space-y-5" aria-label="Discovery conversation">
        {conversation.map((entry, index) => (
          <div key={`${entry.role}-${index}`} className={entry.role === "assistant" ? "max-w-xl border-l-2 border-clay pl-5 font-serif text-2xl leading-8 text-ink sm:text-[1.7rem] sm:leading-9" : "ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-paper px-5 py-4 text-[0.95rem] leading-7 shadow-[0_8px_24px_rgba(69,51,38,0.06)]"}>{entry.content}</div>
        ))}
      </section>
      {result?.phase === "reflecting" ? (
        <section className="mirror-rise rounded-2xl border border-line bg-paper p-7 shadow-[0_12px_35px_rgba(69,51,38,0.06)]">
          <h2 className="font-display text-3xl text-ink">I think I see you.</h2>
          <p className="mt-3 leading-7 text-muted-ink">Your Mirror is saved. Head to Workshop to develop something &mdash; or revisit your Mirror.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-dark" href="/workshop">Try a Workshop</Link>
            <Link className="rounded-full border border-line bg-cream px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-clay" href="/mirror">See my Mirror</Link>
            <button className="px-3 text-sm font-medium text-muted-ink underline decoration-clay underline-offset-4" onClick={resetDiscovery}>Start over</button>
          </div>
        </section>
      ) : (
        <form onSubmit={submitDiscovery} className="rounded-2xl border border-line bg-paper p-5 shadow-[0_12px_35px_rgba(69,51,38,0.05)] sm:p-6">
          <label className="sr-only" htmlFor="message">Your answer</label>
          <textarea id="message" placeholder={"Say what's on your mind\u2026"} onKeyDown={handleKeyDown} className="min-h-32 w-full resize-y bg-transparent text-lg leading-7 text-ink outline-none placeholder:text-muted-ink" required value={message} onChange={(event) => setMessage(event.target.value)} />
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
            <span className="text-xs text-muted-ink">{"\u2318/Ctrl + Enter to send"}</span>
            <button disabled={isLoading} className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? "Thinking\u2026" : "Send"}</button>
          </div>
          {isLoading && <p className="mt-4 font-serif text-xl text-muted-ink">Thinking…</p>}
          {error && <p role="alert" className="mt-4 text-sm text-clay-dark">{error}</p>}
        </form>
      )}
    </main>
  );
}
