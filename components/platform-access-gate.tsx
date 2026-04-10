"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { demoCopy } from "@/lib/copy";
import {
  PLATFORM_ACCESS_STORAGE_KEY,
  PLATFORM_ACCESS_TERMS,
} from "@/lib/constants";
import {
  createPlatformAccessChallengeSet,
  evaluateArithmeticExpression,
  PlatformAccessChallengeSet,
  PlatformAccessRecord,
} from "@/lib/platform-access";
import { PlatformAccessSessionContext } from "@/lib/platform-access-session";

type AccessStage = 1 | 2 | 3 | 4;

interface StageState {
  input: string;
  error: string | null;
}

function getStoredPlatformAccess() {
  const raw = window.sessionStorage.getItem(PLATFORM_ACCESS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PlatformAccessRecord;
  } catch {
    window.sessionStorage.removeItem(PLATFORM_ACCESS_STORAGE_KEY);
    return null;
  }
}

function createEmptyStageState(): StageState {
  return {
    input: "",
    error: null,
  };
}

export function PlatformAccessGate({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [accessRecord, setAccessRecord] = useState<PlatformAccessRecord | null>(null);
  const [pendingRecord, setPendingRecord] = useState<PlatformAccessRecord | null>(null);
  const [stage, setStage] = useState<AccessStage>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [stageState, setStageState] = useState<StageState>(createEmptyStageState());
  const [challengeSet, setChallengeSet] = useState<PlatformAccessChallengeSet | null>(null);
  const [accessKeyParts, setAccessKeyParts] = useState<string[]>([]);

  useEffect(() => {
    const storedAccess = getStoredPlatformAccess();

    setAccessRecord(storedAccess);
    setChallengeSet(createPlatformAccessChallengeSet());
    setIsHydrated(true);
  }, []);

  function resetAccessFlow() {
    window.sessionStorage.removeItem(PLATFORM_ACCESS_STORAGE_KEY);
    setAccessRecord(null);
    setPendingRecord(null);
    setStage(1);
    setAcceptedTerms(false);
    setStageState(createEmptyStageState());
    setChallengeSet(createPlatformAccessChallengeSet());
    setAccessKeyParts([]);
  }

  function downloadAccessKeyFile(record: PlatformAccessRecord) {
    if (record.accessKeyId) {
      window.location.href = `/api/platform-access-keys?accessKeyId=${record.accessKeyId}`;
      return;
    }

    const text = [
      "SRJ ACCESS KEY",
      `Created At: ${record.unlockedAt}`,
      "",
      record.accessKey,
      "",
    ].join("\n");
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${record.accessKeyId ?? "srj-access-key"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeChallenge = useMemo(() => {
    if (!challengeSet) {
      return null;
    }

    if (stage === 1) {
      return {
        title: demoCopy.platformAccess.stages.stageOneTitle,
        helper: demoCopy.platformAccess.stages.stageOneHelper,
        prompt: challengeSet.stageOne.prompt,
        placeholder: demoCopy.platformAccess.stages.stageOnePlaceholder,
      };
    }

    if (stage === 2) {
      return {
        title: demoCopy.platformAccess.stages.stageTwoTitle,
        helper: demoCopy.platformAccess.stages.stageTwoHelper,
        prompt: challengeSet.stageTwo.prompt,
        placeholder: demoCopy.platformAccess.stages.stageTwoPlaceholder,
      };
    }

    if (stage === 3) {
      return {
        title: demoCopy.platformAccess.stages.stageThreeTitle,
        helper: demoCopy.platformAccess.stages.stageThreeHelper,
        prompt: challengeSet.stageThree.prompt,
        placeholder: demoCopy.platformAccess.stages.stageThreePlaceholder,
      };
    }

    return null;
  }, [challengeSet, stage]);

  if (!isHydrated || !challengeSet) {
    return (
      <PlatformAccessSessionContext.Provider
        value={{ accessRecord, logout: resetAccessFlow }}
      >
        {children}
      </PlatformAccessSessionContext.Provider>
    );
  }

  if (accessRecord && !pendingRecord) {
    return (
      <PlatformAccessSessionContext.Provider
        value={{ accessRecord, logout: resetAccessFlow }}
      >
        {children}
      </PlatformAccessSessionContext.Provider>
    );
  }

  function updateStageState(nextState: Partial<StageState>) {
    setStageState((current) => ({
      ...current,
      ...nextState,
    }));
  }

  function moveToNextStage(nextPart: string, nextStage: AccessStage) {
    setAccessKeyParts((current) => [...current, nextPart]);
    setStage(nextStage);
    setStageState(createEmptyStageState());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!challengeSet) {
      return;
    }

    if (!acceptedTerms) {
      updateStageState({
        error: demoCopy.platformAccess.errors.acceptTerms,
      });
      return;
    }

    const normalizedInput = stageState.input.trim();

    if (!normalizedInput) {
      updateStageState({
        error: demoCopy.platformAccess.errors.emptyResponse,
      });
      return;
    }

    if (stage === 1) {
      if (normalizedInput !== challengeSet.stageOne.answer) {
        updateStageState({
          error: demoCopy.platformAccess.errors.wrongArithmetic,
        });
        return;
      }

      moveToNextStage(normalizedInput, 2);
      return;
    }

    if (stage === 2) {
      const normalizedAnswer = normalizedInput.toLowerCase();

      if (!["yes", "no"].includes(normalizedAnswer)) {
        updateStageState({
          error: demoCopy.platformAccess.errors.yesNoRequired,
        });
        return;
      }

      if (normalizedAnswer !== challengeSet.stageTwo.answer) {
        updateStageState({
          error: demoCopy.platformAccess.errors.wrongVerification,
        });
        return;
      }

      moveToNextStage(normalizedAnswer, 3);
      return;
    }

    if (stage === 3) {
      const evaluated = evaluateArithmeticExpression(normalizedInput);

      if (evaluated === null) {
        updateStageState({
          error: demoCopy.platformAccess.errors.invalidExpression,
        });
        return;
      }

      if (evaluated !== challengeSet.stageThree.target) {
        updateStageState({
          error: demoCopy.platformAccess.errors.wrongEquivalentRelation,
        });
        return;
      }

      const nextParts = [...accessKeyParts, normalizedInput];
      const nextRecord: PlatformAccessRecord = {
        unlockedAt: new Date().toISOString(),
        accessKey: nextParts.join(" | "),
      };

      try {
        const response = await fetch("/api/platform-access-keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessKey: nextRecord.accessKey,
          }),
        });
        const payload = (await response.json()) as {
          accessKeyId?: string;
        };

        if (response.ok && payload.accessKeyId) {
          nextRecord.accessKeyId = payload.accessKeyId;
        }
      } catch {
        // Session access continues even if key-file persistence fails.
      }

      window.sessionStorage.setItem(
        PLATFORM_ACCESS_STORAGE_KEY,
        JSON.stringify(nextRecord),
      );
      setAccessKeyParts(nextParts);
      setPendingRecord(nextRecord);
      setStage(4);
    }
  }

  return (
    <PlatformAccessSessionContext.Provider
      value={{ accessRecord, logout: resetAccessFlow }}
    >
      <div className="pointer-events-none select-none opacity-25 blur-sm">{children}</div>

      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/55 p-6 backdrop-blur-sm">
        <section className="grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/40 bg-white shadow-panel lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex min-h-0 flex-col bg-ink px-7 py-8 text-white lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              {demoCopy.platformAccess.header.eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {demoCopy.platformAccess.header.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-mist">
              {demoCopy.platformAccess.header.description}
            </p>

            <div className="mt-8 flex min-h-0 flex-1 flex-col rounded-[1.75rem] border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                {demoCopy.platformAccess.header.termsEyebrow}
              </p>
              <p className="mt-3 text-sm font-semibold tracking-[0.08em] text-white/85">
                {demoCopy.platformAccess.header.lastUpdatedLabel}
              </p>
              <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                Scroll to review all terms before proceeding.
              </div>
              <div className="srj-scrollbar mt-4 flex-1 overflow-y-scroll rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-4">
                <div className="space-y-4 text-sm leading-7 text-mist">
                {PLATFORM_ACCESS_TERMS.map((term) => (
                  <p key={term}>{term}</p>
                ))}
                </div>
              </div>
            </div>

            <label className="mt-6 flex items-start gap-4 rounded-[1.5rem] border-2 border-amber-300/80 bg-amber-300/10 p-5 text-base leading-7 text-white shadow-[0_0_0_1px_rgba(253,224,71,0.15)]">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-6 w-6 rounded border-2 border-amber-200 bg-transparent text-amber-300 focus:ring-amber-300"
              />
              <span className="font-medium">{demoCopy.platformAccess.header.acceptLabel}</span>
            </label>
          </div>

          <div className="flex min-h-0 flex-col overflow-auto px-7 py-8 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                  {activeChallenge?.title ?? demoCopy.platformAccess.stages.accessGrantedTitle}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  {stage < 4
                    ? demoCopy.platformAccess.stages.buildKeyTitle
                    : demoCopy.platformAccess.stages.unlockedTitle}
                </h2>
              </div>
              <div className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-slate">
                {demoCopy.platformAccess.stages.stepPrefix} {Math.min(stage, 3)}{" "}
                {demoCopy.platformAccess.stages.stepJoiner} 3
              </div>
            </div>

            {stage < 4 && activeChallenge ? (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="rounded-[1.75rem] border border-slate-200 bg-mist p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">
                    {demoCopy.platformAccess.stages.promptLabel}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-ink">{activeChallenge.prompt}</p>
                  <p className="mt-4 text-sm leading-6 text-slate">{activeChallenge.helper}</p>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink">
                    {demoCopy.platformAccess.stages.responseLabel}
                  </span>
                  <input
                    value={stageState.input}
                    onChange={(event) =>
                      setStageState({
                        input: event.target.value,
                        error: null,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-signal"
                    placeholder={activeChallenge.placeholder}
                  />
                </label>

                {stageState.error ? (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                    {stageState.error}
                  </div>
                ) : null}

                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ember">
                    {demoCopy.platformAccess.stages.keySequenceLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {accessKeyParts.length > 0
                      ? accessKeyParts.join(" | ")
                      : demoCopy.platformAccess.stages.keySequenceEmpty}
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
                >
                  {stage === 3
                    ? demoCopy.platformAccess.stages.unlockButton
                    : demoCopy.platformAccess.stages.continueButton}
                </button>
              </form>
            ) : null}

            {stage === 4 && pendingRecord ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                    {demoCopy.platformAccess.completion.keyEyebrow}
                  </p>
                  <p className="mt-3 text-xl font-semibold leading-9 text-ink">
                    {pendingRecord.accessKey}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate">
                    {demoCopy.platformAccess.completion.keyBody}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-mist p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">
                    {demoCopy.platformAccess.completion.statusEyebrow}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {demoCopy.platformAccess.completion.statusBody}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadAccessKeyFile(pendingRecord)}
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                >
                  {demoCopy.platformAccess.completion.downloadButton}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccessRecord(pendingRecord);
                    setPendingRecord(null);
                  }}
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
                >
                  {demoCopy.platformAccess.completion.enterButton}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PlatformAccessSessionContext.Provider>
  );
}
