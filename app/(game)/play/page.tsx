import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Avatar } from "@/components/game/Avatar";
import { CategoryMastery } from "@/components/game/CategoryMastery";
import { ReferralCard } from "@/components/game/ReferralCard";

export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile if logged in
  let profile = null;
  let categoryProgress: { category: string; correct: number; total: number }[] = [];
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;

    // Fetch category progress
    const { data: progress } = await supabase
      .from("category_progress")
      .select("category, correct, total")
      .eq("user_id", user.id);
    categoryProgress = progress || [];
  }

  return (
    <main className="min-h-screen flex flex-col p-6">
      {/* Header with user info */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {profile && (
            <Link href="/equipment" className="hover:scale-105 transition-transform">
              <Avatar
                xp={profile.xp || 0}
                loadout={profile.loadout || { armor: "knight", weapon: "sword", shield: "tower" }}
                size="md"
                showTier={true}
              />
            </Link>
          )}
          <div>
            {profile ? (
              <div>
                <p className="text-slate-400 text-sm">Welcome back,</p>
                <p className="font-semibold">{profile.username || user?.email}</p>
              </div>
            ) : (
              <p className="text-slate-400">Playing as guest</p>
            )}
          </div>
        </div>
        {profile && (
          <Link
            href="/profile"
            className="px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            Profile
          </Link>
        )}
      </header>

      {/* Stats bar */}
      {profile && (
        <div className="flex justify-around bg-slate-800 rounded-xl p-4 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{profile.level}</p>
            <p className="text-slate-400 text-xs">Level</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{profile.xp}</p>
            <p className="text-slate-400 text-xs">XP</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">
              {profile.daily_streak}
            </p>
            <p className="text-slate-400 text-xs">Streak 🔥</p>
          </div>
        </div>
      )}

      {/* Game modes */}
      <h2 className="text-xl font-bold mb-4">Choose a Mode</h2>

      <div className="flex flex-col gap-4">
        {/* Quick Play */}
        <Link
          href="/quick"
          className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6
                     hover:from-blue-500 hover:to-blue-400 transition-all
                     min-h-[120px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-bold">Quick Play</h3>
            </div>
            <p className="text-blue-100 text-sm">
              5 random questions • ~2 minutes
            </p>
          </div>
          <p className="text-blue-200 text-xs mt-2">
            Perfect for a quick practice session
          </p>
        </Link>

        {/* Daily Challenge */}
        <Link
          href="/daily"
          className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-6
                     hover:from-orange-500 hover:to-orange-400 transition-all
                     min-h-[120px] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <h3 className="text-xl font-bold">Daily Challenge</h3>
            </div>
            <p className="text-orange-100 text-sm">
              10 curated questions • Once per day
            </p>
          </div>
          <p className="text-orange-200 text-xs mt-2">
            Compete for the leaderboard • Build your streak
          </p>
        </Link>
      </div>

      {/* Category progress (if logged in) */}
      {profile && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <CategoryMastery progress={categoryProgress} />
        </div>
      )}

      {/* Referral card (if logged in) */}
      {profile && (
        <div className="mt-8">
          <ReferralCard />
        </div>
      )}

      {/* Sign in prompt for guests */}
      {!profile && (
        <div className="mt-8 p-4 bg-slate-800 rounded-xl text-center">
          <p className="text-slate-300 mb-3">Sign in to save your progress</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-auto pt-8 flex justify-center gap-6">
        <Link
          href="/leaderboard"
          className="text-slate-400 hover:text-white transition-colors"
        >
          Leaderboard
        </Link>
        <Link
          href="/"
          className="text-slate-400 hover:text-white transition-colors"
        >
          Home
        </Link>
      </nav>
    </main>
  );
}
