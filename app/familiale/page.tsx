"use client";

import { useState } from "react";
import Link from "next/link";
import V1 from "./V1";
import V2 from "./V2";

export default function FamilialeProjectPage() {
  const [version, setVersion] = useState<"v1" | "v2">("v2");

  return (
    <div className="h-screen bg-[#0a0a0a] text-neutral-50 font-sans flex flex-col overflow-hidden">
      {/* Header / Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#111111] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour aux projets
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-base font-semibold tracking-tight text-emerald-400">Projet Villa Évolutive (Familiale)</h1>
        </div>
        
        {/* Toggle */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setVersion("v1")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
              version === "v1" 
                ? "bg-white text-black shadow-sm" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Version 1
          </button>
          <button
            onClick={() => setVersion("v2")}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
              version === "v2" 
                ? "bg-white text-black shadow-sm" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Version 2
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto [&>div]:!h-full [&>div]:!min-h-full">
        {version === "v1" ? <V1 /> : <V2 />}
      </main>
    </div>
  );
}
