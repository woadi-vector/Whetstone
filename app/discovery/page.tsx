"use client";

import { FormEvent, useState } from "react";
import type { DiscoveryResponse } from "@/lib/discovery";

export default function DiscoveryPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitDiscovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body: DiscoveryResponse | { error: string } = await response.json();
      if ("error" in body) throw new Error(body.error);
      if (!response.ok) throw new Error("Discovery failed.");
      setResult(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Discovery failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-10 p-6 sm:pt-16">
      <header><p className="text-sm text-stone-500">Whetstone / Milestone 1</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Discovery test</h1></header>
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
