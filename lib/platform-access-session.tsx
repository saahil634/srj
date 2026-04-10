"use client";

import { createContext, useContext } from "react";

import { PlatformAccessRecord } from "@/lib/platform-access";

interface PlatformAccessSessionValue {
  accessRecord: PlatformAccessRecord | null;
  logout: () => void;
}

export const PlatformAccessSessionContext =
  createContext<PlatformAccessSessionValue | null>(null);

export function usePlatformAccessSession() {
  const context = useContext(PlatformAccessSessionContext);

  if (!context) {
    throw new Error("usePlatformAccessSession must be used within PlatformAccessGate");
  }

  return context;
}
