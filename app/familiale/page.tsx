"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import V1 from "./V1";
import V2 from "./V2";
import V3 from "./V3";

export default function FamilialeProjectPage() {
  const [version, setVersion] = useState<"v1" | "v2" | "v3">("v3");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define available versions here to easily add V3, V4...
  const versions = [
    { id: "v1", label: "Version 1", desc: "Plan RDC Esquisse" },
    { id: "v2", label: "Version 2", desc: "Plan R+2 Détaillé" },
    { id: "v3", label: "Version 3", desc: "Modèle 3D" },
  ];

  const currentVersion = versions.find(v => v.id === version) || versions[2];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen bg-[#0a0a0a] text-neutral-50 font-sans flex flex-col overflow-hidden">
      {/* Header / Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#111111] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour aux projets
          </Link>
          <div className="hidden sm:block h-4 w-px bg-white/20" />
          <h1 className="hidden sm:block text-base font-semibold tracking-tight text-emerald-400">Projet Villa Évolutive</h1>
        </div>
        
        {/* Version Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-emerald-500/50 hover:bg-[#222222] transition-all text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <span className="text-neutral-500 hidden sm:inline-block">Affichage:</span>
            <span>{currentVersion.label}</span>
            <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl py-1 z-50 overflow-hidden backdrop-blur-xl origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-white/5 bg-[#111]">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Versions Disponibles</span>
              </div>
              
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setVersion(v.id as "v1" | "v2");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    version === v.id 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  <div>
                    <div className={`text-sm ${version === v.id ? "font-semibold" : "font-medium"}`}>
                      {v.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${version === v.id ? "text-emerald-500/70" : "text-neutral-500"}`}>
                      {v.desc}
                    </div>
                  </div>
                  
                  {version === v.id && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto [&>div]:!h-full [&>div]:!min-h-full">
        {version === "v1" ? <V1 /> : version === "v2" ? <V2 /> : <V3 />}
      </main>
    </div>
  );
}
