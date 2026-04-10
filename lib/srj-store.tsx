"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AcceptanceRecord, SRJPackageManifest, StoredDemoPackage } from "@/lib/types";

interface PackageDraftInput {
  title: string;
  termsPreset: string;
  packageAccessKey: string;
  ownerRootKeyFileId?: string | null;
  files: File[];
}

interface SRJStoreValue {
  packages: StoredDemoPackage[];
  activePackageId: string | null;
  isLoading: boolean;
  loadError: string | null;
  reloadPackages: () => Promise<StoredDemoPackage[]>;
  createPackage: (input: PackageDraftInput) => Promise<StoredDemoPackage>;
  deletePackage: (
    packageId: string,
    rootKey: string,
    rootKeyFileId?: string | null,
  ) => Promise<void>;
  setActivePackageId: (packageId: string | null) => void;
  importManifest: (manifest: SRJPackageManifest) => void;
  saveAcceptance: (packageId: string, acceptance: AcceptanceRecord) => void;
}

const SRJStoreContext = createContext<SRJStoreValue | null>(null);

export function SRJStoreProvider({ children }: PropsWithChildren) {
  const [packages, setPackages] = useState<StoredDemoPackage[]>([]);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadPackages() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/packages", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        packages?: StoredDemoPackage[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load SRJ packages.");
      }

      const nextPackages = payload.packages ?? [];

      setPackages(nextPackages);
      setActivePackageId((current) => {
        if (!current) {
          return null;
        }

        return nextPackages.some((entry) => entry.manifest.packageId === current)
          ? current
          : null;
      });

      return nextPackages;
    } catch (error) {
      setPackages([]);
      setLoadError(error instanceof Error ? error.message : "Unable to load SRJ packages.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    void loadPackages().catch(() => {
      if (!isMounted) {
        return;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<SRJStoreValue>(() => {
    return {
      packages,
      activePackageId,
      isLoading,
      loadError,
      reloadPackages: loadPackages,
      createPackage: async ({ title, termsPreset, packageAccessKey, ownerRootKeyFileId, files }) => {
        const formData = new FormData();
        formData.set("title", title);
        formData.set("termsPreset", termsPreset);
        formData.set("packageAccessKey", packageAccessKey);
        if (ownerRootKeyFileId) {
          formData.set("ownerRootKeyFileId", ownerRootKeyFileId);
        }

        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch("/api/packages", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as {
          package?: StoredDemoPackage;
          error?: string;
        };

        if (!response.ok || !payload.package) {
          throw new Error(payload.error || "Unable to create the SRJ package.");
        }

        setPackages((current) => [
          payload.package as StoredDemoPackage,
          ...current.filter(
            (entry) => entry.manifest.packageId !== payload.package?.manifest.packageId,
          ),
        ]);
        setActivePackageId(payload.package.manifest.packageId);

        return payload.package;
      },
      deletePackage: async (packageId, rootKey, rootKeyFileId) => {
        const response = await fetch("/api/packages", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            packageId,
            rootKey,
            rootKeyFileId,
          }),
        });
        const payload = (await response.json()) as {
          packageId?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to delete the SRJ package.");
        }

        let nextActivePackageId: string | null = null;

        setPackages((current) => {
          const nextPackages = current.filter((entry) => entry.manifest.packageId !== packageId);

          nextActivePackageId = nextPackages[0]?.manifest.packageId ?? null;

          return nextPackages;
        });
        setActivePackageId((currentActive) =>
          currentActive === packageId ? nextActivePackageId : currentActive,
        );
      },
      setActivePackageId,
      importManifest: (manifest) => {
        setPackages((current) => {
          const existing = current.find((entry) => entry.manifest.packageId === manifest.packageId);

          if (existing) {
            return current.map((entry) =>
              entry.manifest.packageId === manifest.packageId
                ? { ...entry, manifest }
                : entry,
            );
          }

          return [{ manifest, assets: [] }, ...current];
        });

        setActivePackageId(manifest.packageId);
      },
      saveAcceptance: (packageId, acceptance) => {
        setPackages((current) =>
          current.map((entry) =>
            entry.manifest.packageId === packageId
              ? { ...entry, acceptance }
              : entry,
          ),
        );
      },
    };
  }, [activePackageId, isLoading, loadError, packages]);

  return <SRJStoreContext.Provider value={value}>{children}</SRJStoreContext.Provider>;
}

export function useSRJStore() {
  const context = useContext(SRJStoreContext);

  if (!context) {
    throw new Error("useSRJStore must be used within an SRJStoreProvider");
  }

  return context;
}
