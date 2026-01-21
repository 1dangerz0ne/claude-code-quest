"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGlobalStats } from "@/lib/stats";
import { LiveCounter } from "@/components/game/LiveCounter";

export default function HomePage() {
  const [stats, setStats] = useState({ totalPlayers: 0, totalGames: 0, todayPlayers: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch global stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getGlobalStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Format number with K suffix for larger numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo/Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Claude Code
          <span className="block text-blue-400">Quest</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Master Claude Code through bite-sized quizzes
        </p>
      </div>

      {/* Social Proof - Player Count */}
      {!loading && stats.totalPlayers > 0 && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
            <span className="text-green-400">●</span>
            <span className="text-slate-300">
              Join <span className="font-bold text-white">{formatNumber(stats.totalPlayers)}+</span> learners
            </span>
          </div>
        </div>
      )}

      {/* Live Counter */}
      <div className="mb-8">
        <LiveCounter />
      </div>

      {/* Main Actions */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link
          href="/play"
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500
                     rounded-xl text-center text-lg font-semibold
                     transition-colors min-h-[56px] flex items-center justify-center"
        >
          Start Playing
        </Link>

        <Link
          href="/login"
          className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700
                     rounded-xl text-center text-lg font-semibold
                     transition-colors min-h-[56px] flex items-center justify-center"
        >
          Sign In
        </Link>
      </div>

      {/* Live Activity */}
      {!loading && stats.todayPlayers > 0 && (
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            <span className="text-orange-400 font-semibold">{stats.todayPlayers}</span> players completed today&apos;s challenge
          </p>
        </div>
      )}

      {/* Features Preview */}
      <div className="mt-12 grid grid-cols-3 gap-4 text-center max-w-sm w-full">
        <div>
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-sm text-slate-400">Daily Streaks</div>
        </div>
        <div>
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-sm text-slate-400">Quick Play</div>
        </div>
        <div>
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-sm text-slate-400">Leaderboard</div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-12 text-center">
        <p className="text-slate-500 text-sm mb-3">Learn about</p>
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">
            Agents
          </span>
          <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">
            Commands
          </span>
          <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">
            Hooks
          </span>
        </div>
      </div>

      {/* Total Games Played */}
      {!loading && stats.totalGames > 0 && (
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-xs">
            {formatNumber(stats.totalGames)} games played
          </p>
        </div>
      )}
    </main>
  );
}
