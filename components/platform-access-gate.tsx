"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

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

  const activeChallenge = useMemo(() => {
    if (!challengeSet) {
      return null;
    }

    if (stage === 1) {
      return {
        title: "Secure-key 1",
        helper: "Solve the arithmetic prompt exactly to open the next verification step.",
        prompt: challengeSet.stageOne.prompt,
        placeholder: "Enter the numeric result",
      };
    }

    if (stage === 2) {
      return {
        title: "Secure-key 2",
        helper: "Type yes or no to confirm whether the two arithmetic expressions are equivalent.",
        prompt: challengeSet.stageTwo.prompt,
        placeholder: "Enter yes or no",
      };
    }

    if (stage === 3) {
      return {
        title: "Secure-key 3",
        helper:
          "Enter any arithmetic expression that is equivalent to the prompt total. Examples: 10-2, 7+1, 4*2.",
        prompt: challengeSet.stageThree.prompt,
        placeholder: "Enter an equivalent arithmetic expression",
      };
    }

    return null;
  }, [challengeSet, stage]);

  if (!isHydrated || !challengeSet) {
    return <>{children}</>;
  }

  if (accessRecord && !pendingRecord) {
    return (
      <>
        <div className="relative">
          <div className="fixed right-6 top-6 z-[65]">
            <button
              type="button"
              onClick={resetAccessFlow}
              className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate shadow-sm backdrop-blur transition hover:border-signal hover:text-ink"
            >
              Logout session
            </button>
          </div>
          {children}
        </div>
      </>
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!challengeSet) {
      return;
    }

    if (!acceptedTerms) {
      updateStageState({
        error: "You must accept the platform terms before continuing.",
      });
      return;
    }

    const normalizedInput = stageState.input.trim();

    if (!normalizedInput) {
      updateStageState({
        error: "Enter a response to continue.",
      });
      return;
    }

    if (stage === 1) {
      if (normalizedInput !== challengeSet.stageOne.answer) {
        updateStageState({
          error: "That arithmetic result is not correct. Try again.",
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
          error: 'Enter "yes" or "no" for the equivalence check.',
        });
        return;
      }

      if (normalizedAnswer !== challengeSet.stageTwo.answer) {
        updateStageState({
          error: "That verification result is incorrect. Re-evaluate the equation and try again.",
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
          error: "Enter a valid arithmetic expression using numbers and operators.",
        });
        return;
      }

      if (evaluated !== challengeSet.stageThree.target) {
        updateStageState({
          error: "That expression is not equivalent to the prompt total. Try another relation.",
        });
        return;
      }

      const nextParts = [...accessKeyParts, normalizedInput];
      const nextRecord: PlatformAccessRecord = {
        unlockedAt: new Date().toISOString(),
        accessKey: nextParts.join(" | "),
      };

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
    <>
      <div className="pointer-events-none select-none opacity-25 blur-sm">{children}</div>

      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/55 p-6 backdrop-blur-sm">
        <section className="grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/40 bg-white shadow-panel lg:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-auto bg-ink px-7 py-8 text-white lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Platform access authentication
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Secure relational jump access check
            </h1>
            <p className="mt-4 text-base leading-7 text-mist">
              Review the terms, complete the three secure-key prompts, and keep a note of your
              unique secure-relational-jump-access-key for this session.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Terms and conditions
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-mist">
                {PLATFORM_ACCESS_TERMS.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-white/15 bg-white/5 p-4 text-sm leading-6 text-mist">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-signal focus:ring-signal"
              />
              <span>
                I accept the demo terms and understand that the access sequence functions as a
                controlled platform-entry credential.
              </span>
            </label>
          </div>

          <div className="overflow-auto px-7 py-8 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                  {activeChallenge?.title ?? "Access granted"}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  {stage < 4 ? "Build your access key" : "Access unlocked"}
                </h2>
              </div>
              <div className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-slate">
                Step {Math.min(stage, 3)} of 3
              </div>
            </div>

            {stage < 4 && activeChallenge ? (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="rounded-[1.75rem] border border-slate-200 bg-mist p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">
                    Prompt
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-ink">{activeChallenge.prompt}</p>
                  <p className="mt-4 text-sm leading-6 text-slate">{activeChallenge.helper}</p>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink">Secure-key response</span>
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
                    Current key sequence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {accessKeyParts.length > 0
                      ? accessKeyParts.join(" | ")
                      : "Your secure-relational-jump-access-key will be formed as you complete the three steps."}
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
                >
                  {stage === 3 ? "Unlock platform access" : "Continue to next secure-key"}
                </button>
              </form>
            ) : null}

            {stage === 4 && pendingRecord ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                    Secure-relational-jump-access-key
                  </p>
                  <p className="mt-3 text-xl font-semibold leading-9 text-ink">
                    {pendingRecord.accessKey}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate">
                    Take note of this unique combination. It is your secure-relational-jump-access-key
                    for the current demo session.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-mist p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">
                    Session unlocked
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    Platform terms accepted and access authentication completed successfully.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccessRecord(pendingRecord);
                    setPendingRecord(null);
                  }}
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
                >
                  Enter SRJ Demo
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
