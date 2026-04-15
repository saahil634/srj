"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { demoCopy } from "@/lib/copy";
import { PLATFORM_ACCESS_STORAGE_KEY } from "@/lib/constants";
import {
  createPlatformAccessChallengeSet,
  evaluateArithmeticExpression,
  PlatformAccessChallengeSet,
  PlatformAccessRecord,
} from "@/lib/platform-access";
import { PlatformAccessSessionContext } from "@/lib/platform-access-session";
import { StoredDemoPackage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type AccessStage = 1 | 2 | 3 | 4 | 5;
type KeyLookupMode = "secure-key" | "access-key";
type AuthPanelMode = "build" | "access";
type GateScreen = "notice" | "access";

interface StageState {
  input: string;
  error: string | null;
}

interface InvitationLookupPayload {
  keyType?: KeyLookupMode;
  secureKeyRecord?: {
    accessKeyId: string;
    accessKey: string;
    createdAt: string;
    ownerName?: string | null;
    ownerOrganization?: string | null;
    ownerEmail?: string | null;
  };
  packages: StoredDemoPackage[];
}

function renderNoticeText(
  text: string,
  options?: {
    contactEmail?: string;
    italicPhrase?: string;
  },
) {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const email = options?.contactEmail;
    const italicPhrase = options?.italicPhrase;
    const emailIndex = email ? remaining.indexOf(email) : -1;
    const italicIndex = italicPhrase ? remaining.indexOf(italicPhrase) : -1;

    const candidates = [
      emailIndex >= 0 ? { type: "email" as const, index: emailIndex } : null,
      italicIndex >= 0 ? { type: "italic" as const, index: italicIndex } : null,
    ].filter(Boolean) as Array<{ type: "email" | "italic"; index: number }>;

    if (candidates.length === 0) {
      parts.push(<span key={`text-${key++}`}>{remaining}</span>);
      break;
    }

    candidates.sort((left, right) => left.index - right.index);
    const nextToken = candidates[0];

    if (nextToken.index > 0) {
      parts.push(<span key={`text-${key++}`}>{remaining.slice(0, nextToken.index)}</span>);
    }

    if (nextToken.type === "email" && email) {
      parts.push(
        <a
          key={`email-${key++}`}
          href={`mailto:${email}`}
          className="font-semibold text-ink underline decoration-ember/70 underline-offset-4 transition hover:text-ember"
        >
          {email}
        </a>,
      );
      remaining = remaining.slice(nextToken.index + email.length);
      continue;
    }

    if (nextToken.type === "italic" && italicPhrase) {
      parts.push(
        <em key={`italic-${key++}`} className="italic">
          {italicPhrase}
        </em>,
      );
      remaining = remaining.slice(nextToken.index + italicPhrase.length);
    }
  }

  return parts;
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

function persistAccessRecord(record: PlatformAccessRecord) {
  window.sessionStorage.setItem(PLATFORM_ACCESS_STORAGE_KEY, JSON.stringify(record));
}

export function PlatformAccessGate({ children }: { children: ReactNode }) {
  const noticeCopy = demoCopy.platformAccess.notice;
  const projectTitlePhrase = '"Data Sovereignty in the Age of Gen-AI"';
  const [isHydrated, setIsHydrated] = useState(false);
  const [accessRecord, setAccessRecord] = useState<PlatformAccessRecord | null>(null);
  const [pendingRecord, setPendingRecord] = useState<PlatformAccessRecord | null>(null);
  const [stage, setStage] = useState<AccessStage>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [stageState, setStageState] = useState<StageState>(createEmptyStageState());
  const [challengeSet, setChallengeSet] = useState<PlatformAccessChallengeSet | null>(null);
  const [accessKeyParts, setAccessKeyParts] = useState<string[]>([]);
  const [pendingOwnerName, setPendingOwnerName] = useState("");
  const [pendingOwnerOrganization, setPendingOwnerOrganization] = useState("");
  const [pendingOwnerEmail, setPendingOwnerEmail] = useState("");
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isPersistingProfile, setIsPersistingProfile] = useState(false);

  const [invitationCode, setInvitationCode] = useState("");
  const [lookupMode, setLookupMode] = useState<KeyLookupMode>("secure-key");
  const [panelMode, setPanelMode] = useState<AuthPanelMode>("build");
  const [gateScreen, setGateScreen] = useState<GateScreen>("notice");
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);
  const [invitationRecord, setInvitationRecord] = useState<PlatformAccessRecord | null>(null);
  const [invitationPackages, setInvitationPackages] = useState<StoredDemoPackage[]>([]);
  const [ownerActionError, setOwnerActionError] = useState<string | null>(null);
  const [isDeletingPackageId, setIsDeletingPackageId] = useState<string | null>(null);
  const [isDownloadingPackageId, setIsDownloadingPackageId] = useState<string | null>(null);

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
    setInvitationRecord(null);
    setInvitationPackages([]);
    setInvitationCode("");
    setPanelMode("build");
    setGateScreen("notice");
    setNoticeError(null);
    setInvitationError(null);
    setOwnerActionError(null);
    setStage(1);
    setAcceptedTerms(false);
    setStageState(createEmptyStageState());
    setChallengeSet(createPlatformAccessChallengeSet());
    setAccessKeyParts([]);
    setPendingOwnerName("");
    setPendingOwnerOrganization("");
    setPendingOwnerEmail("");
    setCompletionError(null);
  }

  async function persistRootKeyIdentity(record: PlatformAccessRecord) {
    const ownerName = pendingOwnerName.trim() || null;
    const ownerOrganization = pendingOwnerOrganization.trim() || null;
    const ownerEmail = pendingOwnerEmail.trim() || null;

    if (!record.accessKeyId || (!ownerName && !ownerOrganization && !ownerEmail)) {
      const nextRecord = {
        ...record,
        ownerName,
        ownerOrganization,
        ownerEmail,
      };

      persistAccessRecord(nextRecord);

      return nextRecord;
    }

    setIsPersistingProfile(true);

    try {
      const response = await fetch("/api/platform-access-keys", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessKeyId: record.accessKeyId,
          ownerName,
          ownerOrganization,
          ownerEmail,
        }),
      });
      const payload = (await response.json()) as {
        ownerName?: string | null;
        ownerOrganization?: string | null;
        ownerEmail?: string | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || demoCopy.platformAccess.errors.ownerActionFailed);
      }

      const nextRecord: PlatformAccessRecord = {
        ...record,
        ownerName: payload.ownerName ?? ownerName,
        ownerOrganization: payload.ownerOrganization ?? ownerOrganization,
        ownerEmail: payload.ownerEmail ?? ownerEmail,
      };

      persistAccessRecord(nextRecord);

      return nextRecord;
    } finally {
      setIsPersistingProfile(false);
    }
  }

  function downloadAccessKeyFile(record: PlatformAccessRecord) {
    if (record.accessKeyId) {
      window.location.href = `/api/platform-access-keys?accessKeyId=${record.accessKeyId}`;
      return;
    }

      const text = [
      "SRJ SECURE KEY",
      `Created At: ${record.unlockedAt}`,
      `Owner Name: ${record.ownerName || "Unlinked"}`,
      `Owner Organization: ${record.ownerOrganization || "Unlinked"}`,
      `Owner Email: ${record.ownerEmail || "Unlinked"}`,
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
    link.download = `${record.accessKeyId ?? "srj-root-key"}.txt`;
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
      <PlatformAccessSessionContext.Provider value={{ accessRecord, logout: resetAccessFlow }}>
        {children}
      </PlatformAccessSessionContext.Provider>
    );
  }

  if (accessRecord && !pendingRecord) {
    return (
      <PlatformAccessSessionContext.Provider value={{ accessRecord, logout: resetAccessFlow }}>
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

  function handleProceedToAccess() {
    if (!acceptedTerms) {
      setNoticeError(demoCopy.platformAccess.errors.acceptTerms);
      return;
    }

    setNoticeError(null);
    setGateScreen("access");
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
        keyType: "secure-key",
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

      persistAccessRecord(nextRecord);
      setAccessKeyParts(nextParts);
      setPendingRecord(nextRecord);
      setStage(4);
    }
  }

  async function handleInvitationLookup() {
    setInvitationError(null);
    setOwnerActionError(null);

    if (!acceptedTerms) {
      setInvitationError(demoCopy.platformAccess.errors.acceptTerms);
      return;
    }

    const normalizedCode = invitationCode.trim();

    if (!normalizedCode) {
      setInvitationError(demoCopy.platformAccess.errors.invitationCodeRequired);
      return;
    }

    setIsCheckingInvitation(true);

    try {
      const response = await fetch("/api/platform-access-keys/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyType: lookupMode,
          keyValue: normalizedCode,
        }),
      });
      const payload = (await response.json()) as InvitationLookupPayload & { error?: string };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            (lookupMode === "secure-key"
              ? demoCopy.platformAccess.errors.invitationCodeInvalid
              : demoCopy.platformAccess.errors.accessKeyInvalid),
        );
      }

      const nextRecord: PlatformAccessRecord = {
        unlockedAt: new Date().toISOString(),
        accessKey:
          lookupMode === "secure-key"
            ? payload.secureKeyRecord?.accessKey ?? normalizedCode
            : normalizedCode,
        accessKeyId: payload.secureKeyRecord?.accessKeyId ?? null,
        keyType: lookupMode,
        ownerName: payload.secureKeyRecord?.ownerName ?? null,
        ownerOrganization: payload.secureKeyRecord?.ownerOrganization ?? null,
        ownerEmail: payload.secureKeyRecord?.ownerEmail ?? null,
      };

      setInvitationRecord(nextRecord);
      setInvitationPackages(payload.packages ?? []);
    } catch (lookupError) {
      setInvitationRecord(null);
      setInvitationPackages([]);
      setInvitationError(
        lookupError instanceof Error
          ? lookupError.message
          : lookupMode === "secure-key"
            ? demoCopy.platformAccess.errors.invitationCodeInvalid
            : demoCopy.platformAccess.errors.accessKeyInvalid,
      );
    } finally {
      setIsCheckingInvitation(false);
    }
  }

  async function handleInvitationDelete(packageId: string) {
    if (!invitationRecord?.accessKey || invitationRecord.keyType === "access-key") {
      return;
    }

    setOwnerActionError(null);
    setIsDeletingPackageId(packageId);

    try {
      const response = await fetch("/api/packages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          secureKey: invitationRecord.accessKey,
          secureKeyFileId: invitationRecord.accessKeyId ?? null,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || demoCopy.platformAccess.errors.ownerActionFailed);
      }

      setInvitationPackages((current) =>
        current.filter((entry) => entry.manifest.packageId !== packageId),
      );
    } catch (actionError) {
      setOwnerActionError(
        actionError instanceof Error
          ? actionError.message
          : demoCopy.platformAccess.errors.ownerActionFailed,
      );
    } finally {
      setIsDeletingPackageId(null);
    }
  }

  async function handleInvitationDownload(packageId: string) {
    if (!invitationRecord?.accessKey || invitationRecord.keyType === "access-key") {
      return;
    }

    setOwnerActionError(null);
    setIsDownloadingPackageId(packageId);

    try {
      const response = await fetch(`/api/packages/${packageId}/access-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secureKey: invitationRecord.accessKey,
          secureKeyFileId: invitationRecord.accessKeyId ?? null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };

        throw new Error(payload.error || demoCopy.platformAccess.errors.ownerActionFailed);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${packageId}-access-records.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (actionError) {
      setOwnerActionError(
        actionError instanceof Error
          ? actionError.message
          : demoCopy.platformAccess.errors.ownerActionFailed,
      );
    } finally {
      setIsDownloadingPackageId(null);
    }
  }

  async function handleCompletionEnter() {
    if (!pendingRecord) {
      return;
    }

    setCompletionError(null);

    try {
      const nextRecord = await persistRootKeyIdentity(pendingRecord);

      setAccessRecord(nextRecord);
      setPendingRecord(null);
    } catch (error) {
      setCompletionError(
        error instanceof Error ? error.message : demoCopy.platformAccess.errors.ownerActionFailed,
      );
    }
  }

  async function handleCompletionDownload() {
    if (!pendingRecord) {
      return;
    }

    setCompletionError(null);

    try {
      downloadAccessKeyFile(pendingRecord);
    } catch (error) {
      setCompletionError(
        error instanceof Error ? error.message : demoCopy.platformAccess.errors.ownerActionFailed,
      );
    }
  }

  function handleCompletionContinue() {
    setCompletionError(null);
    setStage(5);
  }

  function handleCompletionSkip() {
    if (!pendingRecord) {
      return;
    }

    setCompletionError(null);
    persistAccessRecord(pendingRecord);
    setAccessRecord(pendingRecord);
    setPendingRecord(null);
  }

  function handleInvitationEnter() {
    if (!invitationRecord) {
      return;
    }

    persistAccessRecord(invitationRecord);
    setAccessRecord(invitationRecord);
    setInvitationRecord(null);
    setInvitationPackages([]);
  }

  return (
    <PlatformAccessSessionContext.Provider value={{ accessRecord, logout: resetAccessFlow }}>
      <div className="pointer-events-none select-none opacity-25 blur-sm">{children}</div>

      <div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm md:p-6">
        <div className="mx-auto flex min-h-full w-full flex-col justify-center">
          {gateScreen === "notice" ? (
            <section className="mx-auto w-full max-w-5xl rounded-[2.25rem] border border-white/30 bg-[#f7f0e2] px-8 py-8 text-ink shadow-panel md:px-10 md:py-10 lg:px-14 lg:py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate/90">
                {demoCopy.platformAccess.header.eyebrow}
              </p>
             <h1 className="mt-6 max-w-4xl text-[1.95rem] font-semibold tracking-tight leading-[1.08] md:text-[2.4rem]">
  Secure Relational Jumps (SRJ)
</h1>
<h2 className="mt-3 max-w-4xl text-[1.3rem] font-medium tracking-tight leading-[1.2] text-slate-600 md:text-[1.6rem]">
  Framing data as relations
</h2>
              <p className="mt-8 text-sm font-semibold tracking-[0.08em] text-slate/90">
                {demoCopy.platformAccess.header.lastUpdatedLabel}
              </p>

              <div className="mt-6 rounded-[1.9rem] border border-[#cdb79b] bg-[#e4d2bb] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,250,241,0.45),0_18px_34px_rgba(90,62,36,0.12)]">
                <div className="srj-scrollbar max-h-[52vh] overflow-y-auto pr-4">
                  <div className="space-y-6 text-[0.95rem] leading-7 text-ink/88 md:text-[1rem]">
                  <p>{renderNoticeText(noticeCopy.intro, { contactEmail: noticeCopy.contactEmail })}</p>

                    {noticeCopy.body.slice(0, 3).map((term) => (
                      <p key={term}>
                        {renderNoticeText(term, { italicPhrase: projectTitlePhrase })}
                      </p>
                    ))}

                    <ul className="list-outside list-disc space-y-3 pl-7 marker:text-ember">
                      {noticeCopy.uploadBullets.map((item) => (
                        <li key={item} className="pl-2">
                          {item}
                        </li>
                      ))}
                    </ul>

                    {noticeCopy.body.slice(3).map((term) => (
                      <p key={term}>
                        {renderNoticeText(term, { italicPhrase: projectTitlePhrase })}
                      </p>
                    ))}

                    <p className="font-semibold text-ink">{noticeCopy.acknowledgement}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <label className="flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-ink">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(event.target.checked);
                      setNoticeError(null);
                    }}
                    className="mt-0.5 h-5 w-5 rounded border border-amber-300 bg-white text-ember focus:ring-amber-300"
                  />
                  <span className="font-medium leading-6">
                    {demoCopy.platformAccess.header.acceptLabel}
                  </span>
                </label>

                {noticeError ? (
                  <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {noticeError}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm leading-6 text-slate">
                    {demoCopy.platformAccess.header.description}
                  </p>
                  <button
                    type="button"
                    onClick={handleProceedToAccess}
                    className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
                  >
                    Continue to access authentication
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="mx-auto w-full max-w-3xl rounded-[2.25rem] border border-white/40 bg-white shadow-panel">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 lg:px-7">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                    Access authentication
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {demoCopy.platformAccess.header.title}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setGateScreen("notice")}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                >
                  Back to notice
                </button>
              </div>

              <div className="px-6 py-7 lg:px-7 lg:py-7">
                <div className="grid grid-cols-2 gap-3 rounded-[1.35rem] border border-slate-200 bg-mist p-2">
                  {(
                    [
                      { mode: "build", label: "Build your SRJ-root key" },
                      { mode: "access", label: "Access SRJ-package" },
                    ] as const
                  ).map((item) => {
                    const selected = panelMode === item.mode;

                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => {
                          setPanelMode(item.mode);
                          setInvitationError(null);
                          setOwnerActionError(null);
                        }}
                        className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                          selected
                            ? "bg-white text-signal shadow-sm"
                            : "text-slate hover:bg-white/70 hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {panelMode === "build" ? (
                  <div className="mt-4 space-y-5">
                    {stage < 4 && activeChallenge ? (
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                              {activeChallenge.title}
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                              {demoCopy.platformAccess.stages.buildKeyTitle}
                            </h2>
                          </div>
                          <div className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-slate">
                            {demoCopy.platformAccess.stages.stepPrefix} {Math.min(stage, 3)}{" "}
                            {demoCopy.platformAccess.stages.stepJoiner} 3
                          </div>
                        </div>
                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                          <div className="rounded-[1.75rem] border border-slate-200 bg-mist p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">
                              {demoCopy.platformAccess.stages.promptLabel}
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-ink">
                              {activeChallenge.prompt}
                            </p>
                            <p className="mt-4 text-sm leading-6 text-slate">
                              {activeChallenge.helper}
                            </p>
                          </div>

                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-ink">
                              {demoCopy.platformAccess.stages.responseLabel}
                            </span>
                            <p className="text-sm leading-6 text-slate">
                              {stage === 1
                                ? demoCopy.platformAccess.stages.responseHelp
                                : stage === 2
                                  ? demoCopy.platformAccess.stages.stageTwoResponseHelp
                                  : demoCopy.platformAccess.stages.stageThreeResponseHelp}
                            </p>
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
                      </div>
                    ) : null}

                    {stage === 4 && pendingRecord ? (
                      <div className="space-y-5">
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

                        <div className="rounded-[1.75rem] border border-slate-200 bg-mist p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">
                            {demoCopy.platformAccess.completion.nextTitle}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate">
                            {demoCopy.platformAccess.completion.nextBody}
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

                        {completionError ? (
                          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                            {completionError}
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleCompletionDownload}
                            disabled={isPersistingProfile}
                            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
                          >
                            {demoCopy.platformAccess.completion.downloadButton}
                          </button>

                          <button
                            type="button"
                            onClick={handleCompletionContinue}
                            disabled={isPersistingProfile}
                            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-40"
                          >
                            {demoCopy.platformAccess.completion.continueButton}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {stage === 5 && pendingRecord ? (
                      <div className="space-y-5">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-mist p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">
                            {demoCopy.platformAccess.completion.linkTitle}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate">
                            <span className="font-semibold text-ink">
                              {demoCopy.platformAccess.completion.optionalLabel}
                            </span>{" "}
                            {demoCopy.platformAccess.completion.linkBody}
                          </p>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-ink">
                                {demoCopy.platformAccess.completion.nameLabel}
                              </span>
                              <input
                                value={pendingOwnerName}
                                onChange={(event) => setPendingOwnerName(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-signal"
                                placeholder={demoCopy.platformAccess.completion.namePlaceholder}
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-ink">
                                {demoCopy.platformAccess.completion.organizationLabel}
                              </span>
                              <input
                                value={pendingOwnerOrganization}
                                onChange={(event) => setPendingOwnerOrganization(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-signal"
                                placeholder={demoCopy.platformAccess.completion.organizationPlaceholder}
                              />
                            </label>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-ink">
                                {demoCopy.platformAccess.completion.emailLabel}
                              </span>
                              <input
                                type="email"
                                value={pendingOwnerEmail}
                                onChange={(event) => setPendingOwnerEmail(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-signal"
                                placeholder={demoCopy.platformAccess.completion.emailPlaceholder}
                              />
                            </label>
                          </div>
                        </div>

                        {completionError ? (
                          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                            {completionError}
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setStage(4)}
                            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                          >
                            {demoCopy.platformAccess.completion.backButton}
                          </button>

                          <button
                            type="button"
                            onClick={handleCompletionSkip}
                            disabled={isPersistingProfile}
                            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
                          >
                            {demoCopy.platformAccess.completion.skipButton}
                          </button>

                          <button
                            type="button"
                            onClick={handleCompletionEnter}
                            disabled={isPersistingProfile}
                            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-40"
                          >
                            {demoCopy.platformAccess.completion.enterButton}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal">
                        Access SRJ-package
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                        {demoCopy.platformAccess.header.invitationScreenTitle}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-slate">
                        {demoCopy.platformAccess.header.invitationScreenBody}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-mist p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal">
                          Choose key type
                        </p>
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                        {(["secure-key", "access-key"] as const).map((mode) => {
                          const selected = lookupMode === mode;
                          const label =
                            mode === "secure-key"
                              ? demoCopy.platformAccess.header.invitationTypeSecure
                              : demoCopy.platformAccess.header.invitationTypeAccess;

                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setLookupMode(mode);
                                setInvitationError(null);
                                setInvitationRecord(null);
                                setInvitationPackages([]);
                                setOwnerActionError(null);
                              }}
                              className={`rounded-[1rem] border px-3 py-2.5 text-sm font-semibold transition ${
                                selected
                                  ? "border-signal bg-white text-signal shadow-sm"
                                  : "border-slate-200 bg-white/70 text-slate hover:border-slate-300"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2.5 flex flex-col gap-2.5 md:flex-row md:items-end">
                        <label className="block flex-1 space-y-2">
                          <span className="text-sm font-medium text-ink">
                            {demoCopy.platformAccess.header.invitationLabel}
                          </span>
                          <input
                            value={invitationCode}
                            onChange={(event) => {
                              setInvitationCode(event.target.value);
                              setInvitationError(null);
                            }}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal"
                            placeholder={
                              lookupMode === "secure-key"
                                ? demoCopy.platformAccess.header.secureKeyPlaceholder
                                : demoCopy.platformAccess.header.accessKeyPlaceholder
                            }
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleInvitationLookup}
                          disabled={isCheckingInvitation}
                          className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
                        >
                          {isCheckingInvitation
                            ? demoCopy.platformAccess.header.invitationLoadingButton
                            : lookupMode === "secure-key"
                              ? demoCopy.platformAccess.header.secureKeyButton
                              : demoCopy.platformAccess.header.accessKeyButton}
                        </button>
                      </div>
                      {invitationError ? (
                        <div className="mt-2.5 rounded-[1.15rem] border border-red-200 bg-red-50 p-2.5 text-sm leading-6 text-red-700">
                          {invitationError}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {panelMode === "access" && invitationRecord ? (
                  <div className="mt-5 space-y-5 rounded-[1.6rem] border border-slate-200 bg-white p-4.5">
                    <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
                        {demoCopy.platformAccess.invitationResult.eyebrow}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-ink">
                        {invitationRecord.keyType === "secure-key"
                          ? demoCopy.platformAccess.invitationResult.title
                          : "Packages linked to this SRJ-access key"}
                      </h2>
                      {invitationRecord.keyType === "secure-key" ? (
                        <>
                          <p className="mt-3 text-sm leading-6 text-slate">
                            {invitationRecord.ownerName ||
                              demoCopy.platformAccess.invitationResult.ownerFallback}
                            {" · "}
                            {invitationRecord.ownerOrganization ||
                              demoCopy.platformAccess.invitationResult.organizationFallback}
                            {" · "}
                            {invitationRecord.ownerEmail ||
                              demoCopy.platformAccess.invitationResult.emailFallback}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate">
                            SRJ-root key created {formatDateTime(invitationRecord.unlockedAt)}
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-slate">
                          Shared package access was matched through this SRJ-access key.
                        </p>
                      )}
                    </div>

                    {ownerActionError ? (
                      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                        {ownerActionError}
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      {invitationPackages.length === 0 ? (
                        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate">
                          {invitationRecord.keyType === "secure-key"
                            ? demoCopy.platformAccess.invitationResult.noPackages
                            : demoCopy.platformAccess.invitationResult.noAccessKeyPackages}
                        </div>
                      ) : null}

                      {invitationPackages.map((pkg) => (
                        <div
                          key={pkg.manifest.packageId}
                          className="rounded-[1.5rem] border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-ink">{pkg.manifest.title}</p>
                              <p className="mt-1 text-sm text-slate">{pkg.manifest.packageId}</p>
                              <p className="mt-1 text-sm text-slate">
                                {formatDateTime(pkg.manifest.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  persistAccessRecord(invitationRecord);
                                  setAccessRecord(invitationRecord);
                                  setInvitationRecord(null);
                                  setInvitationPackages([]);
                                  window.location.href = `/open?packageId=${pkg.manifest.packageId}`;
                                }}
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                              >
                                {demoCopy.platformAccess.invitationResult.openButton}
                              </button>
                              {invitationRecord.keyType === "secure-key" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleInvitationDownload(pkg.manifest.packageId)}
                                    disabled={isDownloadingPackageId === pkg.manifest.packageId}
                                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
                                  >
                                    {isDownloadingPackageId === pkg.manifest.packageId
                                      ? demoCopy.retrieveExperience.lookup.retrievingButton
                                      : demoCopy.platformAccess.invitationResult.downloadRecordsButton}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInvitationDelete(pkg.manifest.packageId)}
                                    disabled={isDeletingPackageId === pkg.manifest.packageId}
                                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-40"
                                  >
                                    {isDeletingPackageId === pkg.manifest.packageId
                                      ? demoCopy.retrieveExperience.lookup.retrievingButton
                                      : demoCopy.platformAccess.invitationResult.deleteButton}
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleInvitationEnter}
                      className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
                    >
                      {demoCopy.platformAccess.invitationResult.enterButton}
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          )}
        </div>
      </div>
    </PlatformAccessSessionContext.Provider>
  );
}
