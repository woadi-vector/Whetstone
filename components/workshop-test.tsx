"use client";

import { FormEvent, useState } from "react";
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
      const response = await fetch("/api/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextConversation }),
      });
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

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 p-6 sm:pt-16">
      <header>
        <p className="text-sm text-stone-500">Whetstone / Workshop</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your Workshop</h1>
        <p className="mt-3 text-stone-700">Bring something raw. We'll make it concrete together.</p>
      </header>

      <section className="space-y-4" aria-label="Workshop conversation">
        {conversation.map((entry, index) => (
          <div key={`${entry.role}-${index}`} className={entry.role === "assistant" ? "rounded-lg bg-stone-100 p-3" : "rounded-lg bg-amber-50 p-3"}>
            <p>{entry.content}</p>
            {entry.role === "assistant" && anchors[index] && <p className="mt-3 border-l-2 border-amber-800 pl-3 text-sm italic text-stone-600">Mirror: “{anchors[index]}”</p>}
          </div>
        ))}
      </section>

      {!isComplete ? (
        <form onSubmit={submitWorkshop} className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="idea">Your raw idea or decision</label>
          <textarea id="idea" className="min-h-32 w-full rounded border border-stone-300 p-3" required value={idea} onChange={(event) => setIdea(event.target.value)} />
          <button disabled={isLoading} className="rounded bg-amber-800 px-4 py-2 text-white disabled:opacity-60">{isLoading ? "Thinking…" : "Send"}</button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </form>
      ) : (
        <p className="rounded-lg bg-stone-900 p-4 text-stone-100">Workshop complete.</p>
      )}
    </main>
  );
}
