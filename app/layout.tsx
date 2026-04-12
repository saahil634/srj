import type { Metadata } from "next";

import { NavBar } from "@/components/nav-bar";
import { PlatformAccessGate } from "@/components/platform-access-gate";
import { RevealFooter } from "@/components/reveal-footer";
import { demoCopy } from "@/lib/copy";
import { SRJStoreProvider } from "@/lib/srj-store";

import "./globals.css";

export const metadata: Metadata = {
  title: demoCopy.app.title,
  description: demoCopy.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SRJStoreProvider>
          <PlatformAccessGate>
            <div className="min-h-screen bg-grid-fade bg-[size:42px_42px]">
              <NavBar />
              <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
              <RevealFooter />
            </div>
          </PlatformAccessGate>
        </SRJStoreProvider>
      </body>
    </html>
  );
}
