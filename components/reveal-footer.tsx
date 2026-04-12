"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function RevealFooter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + window.innerHeight;
      const threshold = document.documentElement.scrollHeight - 120;
      setIsVisible(scrollPosition >= threshold);
    }

    function handlePointerMove(event: MouseEvent) {
      if (event.clientY >= window.innerHeight - 72) {
        setIsVisible(true);
        return;
      }

      if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 120) {
        setIsVisible(false);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handlePointerMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="pointer-events-auto rounded-full border border-white/60 bg-white/85 px-4 py-2 text-[11px] font-medium tracking-[0.04em] text-slate shadow-panel backdrop-blur-md">
        Developed by Turam Purty, hosted on{" "}
        <Link
          href="https://www.birdroot.org"
          target="_blank"
          rel="noreferrer"
          className="text-ember underline decoration-ember/50 underline-offset-2 transition hover:text-signal"
        >
          www.birdroot.org
        </Link>
        .
      </div>
    </div>
  );
}
