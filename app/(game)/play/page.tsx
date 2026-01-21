import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile if logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <main className="min-h-screen flex flex-col p-6">
      {/* Header with user info */}
      <header className="flex justify-between items-center mb-8">
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
          <div className="space-y-3">
            <CategoryProgress category="Agents" progress={0} total={15} />
            <CategoryProgress category="Commands" progress={0} total={15} />
            <CategoryProgress category="Hooks" progress={0} total={15} />
          </div>
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

// Category progress component
function CategoryProgress({
  category,
  progress,
  total,
}: {
  category: string;
  progress: number;
  total: number;
}) {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{category}</span>
        <span className="text-slate-400 text-sm">
          {progress}/{total}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
