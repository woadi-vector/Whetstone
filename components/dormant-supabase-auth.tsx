"use client";

// TODO(auth): Restore this Supabase OTP screen when managed user auth is resumed.
// It is intentionally dormant while the temporary DEV_GATE_CODE door is active.
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DormantSupabaseAuth() {
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
    if (error) setError(error.message);
    else {
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
    for (const type of ["email", "magiclink", "signup"] as const) {
      const { error } = await createClient().auth.verifyOtp({ email, token, type });
      if (!error) {
        router.push("/discovery");
        return;
      }
    }
    setError("That code is wrong or expired. Request a new code and try again.");
    setIsSubmitting(false);
  }

  return codeSent ? (
    <form onSubmit={verifyCode}>
      <input inputMode="numeric" maxLength={6} value={token} onChange={(event) => setToken(event.target.value)} />
      <button disabled={isSubmitting}>Verify code</button>
      {error && <p role="alert">{error}</p>}
    </form>
  ) : (
    <form onSubmit={requestCode}>
      <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <button disabled={isSubmitting}>Email me a code</button>
      {notice && <p>{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
