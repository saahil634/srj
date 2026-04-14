"use client";

import { FormEvent, useEffect, useState } from "react";

import { demoCopy } from "@/lib/copy";

interface TermsAcceptanceModalProps {
  packageId: string;
  accessorRootKey?: string | null;
  ownerSession?: {
    canSkipIdentity: boolean;
    sessionKey?: string | null;
    ownerName?: string | null;
    ownerEmail?: string | null;
    ownerOrganization?: string | null;
  };
  open: boolean;
  onClose: () => void;
  onAccepted: (acceptance: {
    fullName: string;
    organization: string;
    email: string;
    acceptedAt: string;
  }) => void;
}

export function TermsAcceptanceModal({
  packageId,
  accessorRootKey,
  ownerSession,
  open,
  onClose,
  onAccepted,
}: TermsAcceptanceModalProps) {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFullName(ownerSession?.ownerName ?? "");
    setOrganization(ownerSession?.ownerOrganization ?? "");
    setEmail(ownerSession?.ownerEmail ?? "");
    setAccepted(false);
    setError(null);
  }, [
    open,
    ownerSession?.ownerEmail,
    ownerSession?.ownerName,
    ownerSession?.ownerOrganization,
  ]);

  if (!open) {
    return null;
  }

  function buildOwnerSessionIdentity() {
    return {
      fullName:
        fullName.trim() || ownerSession?.ownerName?.trim() || demoCopy.termsModal.ownerSession.fallbackName,
      email:
        email.trim() || ownerSession?.ownerEmail?.trim() || demoCopy.termsModal.ownerSession.fallbackEmail,
      organization:
        organization.trim() ||
        ownerSession?.ownerOrganization?.trim() ||
        demoCopy.termsModal.ownerSession.fallbackOrganization,
    };
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
          organization,
          email,
          accepted,
          accessorRootKey,
        }),
      });
      const payload = (await response.json()) as { acceptedAt?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || demoCopy.termsModal.errors.unableToLog);
      }

      onAccepted({
        fullName,
        organization,
        email,
        acceptedAt: payload.acceptedAt || new Date().toISOString(),
      });

      setFullName("");
      setOrganization("");
      setEmail("");
      setAccepted(false);
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : demoCopy.termsModal.errors.unableToLogFallback,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOwnerSkip() {
    if (!ownerSession?.canSkipIdentity) {
      return;
    }

    if (!accepted) {
      setError(demoCopy.termsModal.errors.acceptRequired);
      return;
    }

    const ownerIdentity = buildOwnerSessionIdentity();

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
          fullName: ownerIdentity.fullName,
          organization: ownerIdentity.organization,
          email: ownerIdentity.email,
          accepted,
          accessorRootKey,
          skipIdentityEntry: true,
        }),
      });
      const payload = (await response.json()) as { acceptedAt?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || demoCopy.termsModal.errors.unableToLog);
      }

      onAccepted({
        ...ownerIdentity,
        acceptedAt: payload.acceptedAt || new Date().toISOString(),
      });

      setFullName("");
      setOrganization("");
      setEmail("");
      setAccepted(false);
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : demoCopy.termsModal.errors.unableToLogFallback,
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
              {demoCopy.termsModal.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{demoCopy.termsModal.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate"
          >
            {demoCopy.termsModal.closeButton}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {ownerSession?.canSkipIdentity ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal">
                {demoCopy.termsModal.ownerSession.eyebrow}
              </p>
              <p className="mt-2 break-all text-sm font-semibold leading-6 text-ink">
                {ownerSession.sessionKey || accessorRootKey}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate">
                {demoCopy.termsModal.ownerSession.body}
              </p>
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">{demoCopy.termsModal.fields.fullNameLabel}</span>
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder={demoCopy.termsModal.fields.fullNamePlaceholder}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">{demoCopy.termsModal.fields.emailLabel}</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder={demoCopy.termsModal.fields.emailPlaceholder}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">{demoCopy.termsModal.fields.organizationLabel}</span>
            <input
              required
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder={demoCopy.termsModal.fields.organizationPlaceholder}
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
            <span>{demoCopy.termsModal.acceptanceLabel}</span>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm text-slate">
              {demoCopy.termsModal.packagePrefix} {packageId}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {ownerSession?.canSkipIdentity ? (
                <button
                  type="button"
                  onClick={handleOwnerSkip}
                  disabled={isSubmitting}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:cursor-wait disabled:opacity-70"
                >
                  {isSubmitting
                    ? demoCopy.termsModal.submitLoading
                    : demoCopy.termsModal.ownerSession.skipButton}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? demoCopy.termsModal.submitLoading : demoCopy.termsModal.submitIdle}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
