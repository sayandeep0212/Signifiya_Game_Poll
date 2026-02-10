"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  runTransaction,
  Database,
} from "firebase/database";

type Game = {
  name: string;
  votes: number;
  fixed: boolean;
};

export default function Page() {
  const [db, setDb] = useState<Database | null>(null);
  const [games, setGames] = useState<Record<string, Game>>({});
  const [newGame, setNewGame] = useState("");
  const [userVote, setUserVote] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); 

  /* ================= FIREBASE INIT ================= */
  useEffect(() => {
    setMounted(true); 

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const database = getDatabase(app);
    setDb(database);

    /* FORCE FIXED EVENT GAMES */
    set(ref(database, "games/bgmi"), {
      name: "BGMI",
      votes: 0,
      fixed: true,
    });

    set(ref(database, "games/valorant"), {
      name: "VALORANT",
      votes: 0,
      fixed: true,
    });

    const savedVote = localStorage.getItem("userVote");
    if (savedVote) setUserVote(savedVote);
  }, []);

  /* ================= REALTIME ================= */
  useEffect(() => {
    if (!db) return;
    return onValue(ref(db, "games"), (snap) => {
      setGames(snap.val() || {});
    });
  }, [db]);

  /* ================= ADD GAME ================= */
  const addGame = async () => {
    if (!db || !newGame.trim()) return;

    await push(ref(db, "games"), {
      name: newGame.trim().toUpperCase(),
      votes: 0,
      fixed: false,
    });

    setNewGame("");
  };

  /* ================= SINGLE ACTIVE VOTE ================= */
  const voteGame = async (id: string) => {
    if (!db) return;

    const previousVote = localStorage.getItem("userVote");
    if (previousVote === id) return;

    await runTransaction(ref(db, "games"), (current) => {
      if (!current) return current;

      if (previousVote && current[previousVote]) {
        current[previousVote].votes = Math.max(
          0,
          current[previousVote].votes - 1
        );
      }

      if (current[id]) {
        current[id].votes += 1;
      }

      return current;
    });

    localStorage.setItem("userVote", id);
    setUserVote(id);
  };

  /* ================= CALC MAX VOTES (For Progress Bar) ================= */
  const maxVotes = Math.max(
    1,
    ...Object.values(games)
      .filter((g) => !g.fixed)
      .map((g) => g.votes)
  );

  return (
    <main 
      suppressHydrationWarning={true} 
      className="relative min-h-screen px-6 py-10 text-white overflow-hidden bg-[#050505]"
    >
      
      {/* ===================== NEW GAMING VFX LAYERS ===================== */}
      
      {/* 1. CRT Scanline Overlay (TV Effect) */}
      <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* 2. Vignette (Dark corners to focus center) */}
      <div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" />

      {/* 3. Floating Ambient Orbs (Breathing Light) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse -z-10" />

      {/* 4. Perspective Cyber Grid Floor */}
      <div className="absolute inset-0 -z-20 overflow-hidden perspective-[1000px]">
        <div className="absolute bottom-[-20%] -left-[50%] -right-[50%] h-[80%] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [transform:rotateX(60deg)] opacity-40 mask-image:linear-gradient(to_bottom,transparent,black)" />
      </div>

      {/* 5. Original Subtle Dots */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(rgba(0,255,170,0.2)_1px,transparent_1px)] bg-[size:100%_4px]" />
      
      {/* ================================================================= */}

      {/* HEADER */}
      <section className="flex flex-col items-center mb-16 relative z-10">
        <div className="relative">
            <Image
            src="/Signifiya_Logo.png"
            alt="Signifiya Logo"
            width={90}
            height={90}
            priority
            className="drop-shadow-[0_0_15px_rgba(0,255,170,0.5)]"
            />
            {/* Logo Glow */}
            <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full -z-10" />
        </div>
        
        <h1
          className="mt-4 text-2xl tracking-[0.45em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-[0_0_10px_rgba(0,255,170,0.8)] text-center"
          style={{ fontFamily: "Bicubik, sans-serif" }} 
        >
          SIGNIFIYA 2026
        </h1>
        <p className="mt-2 text-sm tracking-widest text-green-400 font-mono">
          [ GAME EVENT SELECTION PROTOCOL ]
        </p>
      </section>

      {/* ADD GAME INPUT */}
      <section className="flex justify-center mb-20 relative z-10">
        <div className="flex items-center gap-3 w-full max-w-md 
                        bg-black/40 backdrop-blur-md 
                        border border-green-400/30 
                        rounded-2xl p-2 
                        shadow-[0_0_30px_rgba(0,255,170,0.15)]
                        group focus-within:shadow-[0_0_50px_rgba(0,255,170,0.4)] focus-within:border-green-400 transition-all duration-300">
          <input
            suppressHydrationWarning={true} 
            value={newGame}
            onChange={(e) => setNewGame(e.target.value)}
            placeholder="SUGGEST A COMMUNITY GAME..."
            className="flex-1 bg-transparent px-4 py-3 
                       text-white tracking-widest 
                       outline-none placeholder:text-gray-600 font-mono text-sm"
          />
          <button
            onClick={addGame}
            className="px-6 py-3 rounded-xl 
                       bg-green-500 text-black font-bold tracking-widest 
                       hover:bg-green-400 hover:shadow-[0_0_20px_rgba(0,255,170,0.6)]
                       active:scale-95 transition-all duration-200 clip-path-polygon"
          >
            ADD
          </button>
        </div>
      </section>

      {/* 🏆 FIXED OFFICIAL GAMES */}
      <section className="mb-20 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-[1px] w-12 bg-yellow-500/50"></div>
            <h2 className="text-center text-lg tracking-[0.4em] text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            OFFICIAL MAINFRAME
            </h2>
            <div className="h-[1px] w-12 bg-yellow-500/50"></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {["bgmi", "valorant"].map((id) => (
            <div
              key={id}
              className="relative h-48 rounded-2xl p-6 
                         border border-yellow-500/50
                         bg-gradient-to-br from-yellow-900/20 to-black
                         backdrop-blur-sm
                         cursor-not-allowed select-none 
                         shadow-[0_0_20px_rgba(255,215,0,0.1)]
                         hover:shadow-[0_0_50px_rgba(255,215,0,0.3)] hover:border-yellow-400 transition-all duration-500 group"
            >
              {/* Animated Scanline inside card */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,215,0,0.1)_50%,transparent_100%)] bg-[length:100%_200%] animate-[scan_3s_linear_infinite] opacity-0 group-hover:opacity-100 pointer-events-none" />

              <h3
                className="text-4xl tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600"
                style={{ fontFamily: "Bicubik, sans-serif" }}
              >
                {mounted ? (games[id]?.name || id.toUpperCase()) : id.toUpperCase()}
              </h3>

              <div className="mt-6 flex items-center gap-2 text-yellow-500">
                <span className="text-xl animate-pulse">🔒</span>
                <p className="text-sm tracking-widest font-bold">
                  FIXED EVENT
                </p>
              </div>
              
              <div className="absolute bottom-4 right-4 opacity-70">
                  <span className="text-[9px] tracking-[0.3em] border border-yellow-500/50 text-yellow-500 px-3 py-1 rounded bg-yellow-500/10">OFFICIAL</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🗳️ COMMUNITY VOTING */}
      <section className="pb-20 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-[1px] w-12 bg-green-500/50"></div>
            <h2 className="text-center text-lg tracking-[0.4em] text-green-400 drop-shadow-[0_0_10px_rgba(0,255,170,0.5)]">
            COMMUNITY UPLINK
            </h2>
            <div className="h-[1px] w-12 bg-green-500/50"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-5xl mx-auto items-center">
          {Object.entries(games)
            .filter(([_, g]) => !g.fixed)
            .sort((a, b) => a[0].localeCompare(b[0])) 
            .map(([id, game]) => {
              const isSelected = userVote === id;
              const hasVoted = userVote !== null;
              const votePercentage = (game.votes / maxVotes) * 100;

              return (
                <button
                  key={id}
                  onClick={() => voteGame(id)}
                  className={`relative h-52 rounded-2xl p-6 text-left 
                    border transition-all duration-500 ease-out flex flex-col justify-between group overflow-hidden
                    ${
                      isSelected
                        ? "scale-110 z-10 border-green-400 shadow-[0_0_100px_rgba(0,255,170,0.6)] bg-black" 
                        : hasVoted
                        ? "scale-90 opacity-40 grayscale blur-[1px] border-white/5 bg-black/20" 
                        : "scale-100 hover:scale-105 border-white/10 bg-white/5 hover:border-green-400/50 hover:shadow-[0_0_40px_rgba(0,255,170,0.2)]"
                    }`}
                >
                  {/* Glitch/Noise overlay on Hover */}
                  {!isSelected && !hasVoted && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity" />
                  )}

                  {/* Energy Overlay */}
                  {isSelected && (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.15),transparent_70%)] animate-pulse" />
                        {/* Border Glow */}
                        <div className="absolute inset-0 rounded-2xl border border-green-400/50 shadow-[inset_0_0_20px_rgba(0,255,170,0.2)]" />
                    </>
                  )}

                  <div className="relative z-10">
                    <h3
                      className={`text-3xl tracking-[0.3em] transition-all duration-300 ${isSelected ? "text-white drop-shadow-[0_0_10px_white]" : "text-gray-300"}`}
                      style={{ fontFamily: "Bicubik, sans-serif" }}
                    >
                      {game.name}
                    </h3>

                    <p className={`mt-2 font-mono text-sm transition-colors ${isSelected ? "text-green-400" : "text-gray-500"}`}>
                      STATUS: <span className="font-bold">{game.votes} VOTES</span>
                    </p>
                  </div>

                  {/* 🔥 DYNAMIC PROGRESS BAR */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4 relative z-10">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out relative ${isSelected ? "bg-green-400 shadow-[0_0_15px_#4ade80]" : "bg-gray-500"}`}
                      style={{ width: `${votePercentage}%` }}
                    >
                        {/* Shimmer effect on bar */}
                        <div className="absolute top-0 bottom-0 right-0 w-10 bg-white/50 skew-x-[-20deg] blur-md animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </section>
    </main>
  );
}