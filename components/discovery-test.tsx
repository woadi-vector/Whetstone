"use client";

import { FormEvent, useState } from "react";
import {
  creativityOpenerMessage,
  moodCheckMessage,
  type DiscoveryChatMessage,
  type DiscoveryResponse,
} from "@/lib/discovery";

export default function DiscoveryTest() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [conversation, setConversation] = useState<DiscoveryChatMessage[]>([
    { role: "assistant", content: moodCheckMessage },
  ]);
  const [isWaitingForCreativityAnswer, setIsWaitingForCreativityAnswer] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitDiscovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);
    const nextConversation = [...conversation, { role: "user" as const, content: message }];

    if (!isWaitingForCreativityAnswer) {
      setConversation([
        ...nextConversation,
        { role: "assistant", content: creativityOpenerMessage },
      ]);
      setIsWaitingForCreativityAnswer(true);
      setMessage("");
      setIsLoading(false);
      return;
    }

    setConversation(nextConversation);
    try {
      const response = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextConversation }),
      });
      const body: DiscoveryResponse | { error: string } = await response.json();
      if ("error" in body) throw new Error(body.error);
      if (!response.ok) throw new Error("Discovery failed.");
      setResult(body);
      setConversation([...nextConversation, { role: "assistant", content: body.message }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Discovery failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-10 p-6 sm:pt-16">
      <header><p className="text-sm text-stone-500">Whetstone / Milestone 1</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Discovery test</h1></header>
      <section className="space-y-3" aria-label="Discovery conversation">
        {conversation.map((entry, index) => (
          <p key={`${entry.role}-${index}`} className={entry.role === "assistant" ? "rounded-lg bg-stone-100 p-3" : "rounded-lg bg-amber-50 p-3"}>
            {entry.content}
          </p>
        ))}
      </section>
      <form onSubmit={submitDiscovery} className="space-y-3">
        <label className="block text-sm font-medium" htmlFor="message">Your answer</label>
        <textarea id="message" className="min-h-32 w-full rounded border border-stone-300 p-3" required value={message} onChange={(event) => setMessage(event.target.value)} />
        <button disabled={isLoading} className="rounded bg-amber-800 px-4 py-2 text-white disabled:opacity-60">{isLoading ? "Thinking…" : "Send"}</button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
      {result && <pre className="overflow-auto rounded-lg bg-stone-900 p-4 text-sm text-stone-100">{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}
