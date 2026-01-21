import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLevelFromXP, LEVEL_THRESHOLDS } from "@/lib/game/scoring";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch category progress
  const { data: categoryProgress } = await supabase
    .from("category_progress")
    .select("*")
    .eq("user_id", user.id);

  // Fetch recent games
  const { data: recentGames } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  const levelInfo = profile ? getLevelFromXP(profile.xp || 0) : null;

  // Calculate category stats
  const categories = ["agents", "commands", "hooks"];
  const categoryStats = categories.map((cat) => {
    const progress = categoryProgress?.find((p) => p.category === cat);
    return {
      name: cat,
      correct: progress?.correct || 0,
      total: progress?.total || 0,
    };
  });

  return (
    <main className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          href="/play"
          className="px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          Back
        </Link>
      </header>

      {/* User info */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {(profile?.username || user.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {profile?.username || user.email}
            </h2>
            <p className="text-slate-400">{levelInfo?.title || "Newcomer"}</p>
          </div>
        </div>

        {/* Level progress */}
        {levelInfo && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-400 font-medium">
                Level {levelInfo.level}
              </span>
              <span className="text-slate-400">
                {profile?.xp || 0} /{" "}
                {LEVEL_THRESHOLDS[levelInfo.level]?.xp || "MAX"} XP
              </span>
            </div>
            <ProgressBar
              value={levelInfo.progress}
              max={100}
              color="blue"
              size="md"
            />
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">
            {profile?.xp || 0}
          </p>
          <p className="text-slate-400 text-sm">Total XP</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">
            {profile?.daily_streak || 0}
          </p>
          <p className="text-slate-400 text-sm">Day Streak 🔥</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">
            {recentGames?.length || 0}
          </p>
          <p className="text-slate-400 text-sm">Games Played</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">
            {profile?.longest_daily_streak || 0}
          </p>
          <p className="text-slate-400 text-sm">Best Streak</p>
        </div>
      </div>

      {/* Category progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Category Progress</h3>
        <div className="space-y-3">
          {categoryStats.map((cat) => {
            const percentage =
              cat.total > 0
                ? Math.round((cat.correct / cat.total) * 100)
                : 0;
            return (
              <div key={cat.name} className="bg-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{cat.name}</span>
                  <span className="text-slate-400 text-sm">
                    {percentage}% accuracy
                  </span>
                </div>
                <ProgressBar
                  value={cat.correct}
                  max={Math.max(cat.total, 1)}
                  color="green"
                  size="sm"
                />
                <p className="text-slate-500 text-xs mt-1">
                  {cat.correct} correct out of {cat.total} attempts
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sign out */}
      <form
        action={async () => {
          "use server";
          const supabase = await createClient();
          await supabase.auth.signOut();
          redirect("/");
        }}
      >
        <button
          type="submit"
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
        >
          Sign Out
        </button>
      </form>
    </main>
  );
}
