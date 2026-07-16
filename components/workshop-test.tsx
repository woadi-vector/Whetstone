"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import type { WorkshopChatMessage, WorkshopResponse } from "@/lib/workshop";

export default function WorkshopTest() {
  const [idea, setIdea] = useState("");
  const [conversation, setConversation] = useState<WorkshopChatMessage[]>([]);
  const [anchors, setAnchors] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function submitWorkshop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const previousConversation = conversation;
    const nextConversation = [...conversation, { role: "user" as const, content: idea }];
    setConversation(nextConversation);
    setIdea("");
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextConversation }) });
      const body: WorkshopResponse | { error: string } = await response.json();
      if ("error" in body) throw new Error(body.error);
      if (!response.ok) throw new Error("Workshop failed.");
      setConversation([...nextConversation, { role: "assistant", content: body.reply }]);
      setAnchors((current) => ({ ...current, [nextConversation.length]: body.mirror_anchor }));
      setIsComplete(body.phase === "closing");
    } catch (caught) {
      setConversation(previousConversation);
      setError(caught instanceof Error ? caught.message : "Workshop failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
      <header className="max-w-xl"><p className="text-sm font-medium uppercase tracking-[0.16em] text-clay">Workshop</p><h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">Your Workshop</h1><p className="mt-5 text-base leading-7 text-muted-ink">Bring something raw. We&apos;ll make it concrete together.</p></header>
      <section className="space-y-6" aria-label="Workshop conversation">
        {conversation.map((entry, index) => (
          <article key={`${entry.role}-${index}`} className={entry.role === "assistant" ? anchors[index] ? "border-l-4 border-clay bg-[#f1dfd6] px-6 py-6" : "border-l-2 border-clay px-5 py-2" : "ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-paper px-5 py-4 shadow-[0_8px_24px_rgba(69,51,38,0.06)]"}>
            <p className={entry.role === "assistant" ? "font-serif text-2xl leading-8 text-ink" : "text-[0.95rem] leading-7 text-ink"}>{entry.content}</p>
            {entry.role === "assistant" && anchors[index] ? <p className="mt-5 border-l-2 border-clay pl-4 font-serif text-xl italic leading-7 text-clay-dark">Mirror: &ldquo;{anchors[index]}&rdquo;</p> : null}
          </article>
        ))}
      </section>
      {isComplete ? <section className="rounded-2xl border border-clay/30 bg-[#f1dfd6] p-6"><p className="font-serif text-2xl text-ink">Workshop complete.</p></section> : <form onSubmit={submitWorkshop} className="rounded-2xl border border-line bg-paper p-5 shadow-[0_12px_35px_rgba(69,51,38,0.05)] sm:p-6"><label className="block font-display text-2xl text-ink" htmlFor="idea">Your raw idea or decision</label><textarea id="idea" onKeyDown={handleKeyDown} placeholder={"Say what's on your mind\u2026"} className="mt-4 min-h-32 w-full resize-y bg-transparent text-lg leading-7 text-ink outline-none placeholder:text-muted-ink" required value={idea} onChange={(event) => setIdea(event.target.value)} /><div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4"><span className="text-xs text-muted-ink">{"\u2318/Ctrl + Enter to send"}</span><button disabled={isLoading} className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? "Thinking\u2026" : "Send"}</button></div>{isLoading && <p className="mt-4 font-serif text-xl text-muted-ink">Thinking…</p>}{error && <p role="alert" className="mt-4 text-sm text-clay-dark">{error}</p>}</form>}
    </main>
  );
}
