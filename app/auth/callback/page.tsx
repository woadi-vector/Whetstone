"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Confirming your sign-in…");

  useEffect(() => {
    createClient().auth.getSession().then(({ error, data }) => {
      if (error || !data.session) {
        setMessage("Could not finish signing you in. Please request a new link.");
        return;
      }

      setMessage("You are signed in. Return to Discovery.");
    });
  }, []);

  return <main className="mx-auto max-w-lg p-6"><p>{message}</p></main>;
}
