"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice("");
    setError("");
    const { error } = await createClient().auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setCodeSent(true);
      setNotice("Enter the 6-digit code from your email.");
    }
    setIsSubmitting(false);
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice("");
    setError("");
    const { error } = await createClient().auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      setError("That code is wrong or expired. Request a new code and try again.");
      setIsSubmitting(false);
      return;
    }
    router.push("/discovery");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 p-6">
      <header><p className="text-sm text-stone-500">Whetstone / Milestone 1</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Start your Discovery</h1></header>
      {!codeSent ? (
        <form onSubmit={requestCode} className="rounded-lg border border-stone-200 bg-white p-4">
          <label className="block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" className="mt-2 w-full rounded border border-stone-300 px-3 py-2" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <button disabled={isSubmitting} className="mt-3 rounded bg-stone-900 px-3 py-2 text-sm text-white disabled:opacity-60">{isSubmitting ? "Sending…" : "Email me a code"}</button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="rounded-lg border border-stone-200 bg-white p-4">
          <label className="block text-sm font-medium" htmlFor="token">6-digit code</label>
          <input id="token" className="mt-2 w-full rounded border border-stone-300 px-3 py-2" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={token} onChange={(event) => setToken(event.target.value.replace(/\D/g, ""))} />
          <button disabled={isSubmitting} className="mt-3 rounded bg-stone-900 px-3 py-2 text-sm text-white disabled:opacity-60">{isSubmitting ? "Checking…" : "Verify code"}</button>
        </form>
      )}
      {notice && <p role="status" className="text-sm text-stone-600">{notice}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </main>
  );
}
