"use client";

import { FormEvent, useState } from "react";

interface TermsAcceptanceModalProps {
  packageId: string;
  open: boolean;
  onClose: () => void;
  onAccepted: (acceptance: { fullName: string; email: string; acceptedAt: string }) => void;
}

export function TermsAcceptanceModal({
  packageId,
  open,
  onClose,
  onAccepted,
}: TermsAcceptanceModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/log-acceptance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          fullName,
          email,
          accepted,
        }),
      });
      const payload = (await response.json()) as { acceptedAt?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to log terms acceptance");
      }

      onAccepted({
        fullName,
        email,
        acceptedAt: payload.acceptedAt || new Date().toISOString(),
      });

      setFullName("");
      setEmail("");
      setAccepted(false);
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to log acceptance",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-panel">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">Terms acceptance</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Unlock SRJ package access</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate"
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Full name</span>
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder="Taylor Morgan"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder="taylor@example.org"
            />
          </label>

          <label className="flex items-start gap-3 rounded-[1.5rem] bg-mist p-4 text-sm leading-6 text-ink">
            <input
              required
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-signal focus:ring-signal"
            />
            <span>
              I accept the stated usage restrictions and understand this access is logged for
              governance review.
            </span>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm text-slate">Package: {packageId}</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? "Recording acceptance..." : "Accept and unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
