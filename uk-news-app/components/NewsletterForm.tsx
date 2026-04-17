"use client";

import { FormEvent, useState } from "react";

interface NewsletterFormProps {
  endpoint: string;
  source: string;
}

export default function NewsletterForm({ endpoint, source }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          source,
        }),
      });

      const json = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Subscription failed");
      }

      setStatus("success");
      setMessage(json.message || "Subscribed successfully.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to subscribe right now.",
      );
    }
  };

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none ring-brand-500 transition focus:ring-2"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {message ? (
        <p
          className={`text-xs ${
            status === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
