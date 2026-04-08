import type { Metadata } from "next";

import { NavBar } from "@/components/nav-bar";
import { SRJStoreProvider } from "@/lib/srj-store";

import "./globals.css";

export const metadata: Metadata = {
  title: "SRJ Demo",
  description: "Prototype flows for creating and opening SRJ packages.",
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
          <div className="min-h-screen bg-grid-fade bg-[size:42px_42px]">
            <NavBar />
            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          </div>
        </SRJStoreProvider>
      </body>
    </html>
  );
}
