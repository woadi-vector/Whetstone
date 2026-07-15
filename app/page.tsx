"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function DevGatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/dev-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error("That passcode is not valid.");
      router.push("/discovery");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open the test page.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 p-6">
      <header><p className="text-sm text-stone-500">Whetstone / temporary dev door</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Enter passcode</h1></header>
      <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-4">
        <label className="block text-sm font-medium" htmlFor="code">Shared passcode</label>
        <input id="code" className="mt-2 w-full rounded border border-stone-300 px-3 py-2" type="password" required value={code} onChange={(event) => setCode(event.target.value)} />
        <button disabled={isSubmitting} className="mt-3 rounded bg-stone-900 px-3 py-2 text-sm text-white disabled:opacity-60">{isSubmitting ? "Checking…" : "Continue"}</button>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      </form>
    </main>
  );
}
