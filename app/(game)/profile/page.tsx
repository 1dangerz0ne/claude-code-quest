import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLevelFromXP, LEVEL_THRESHOLDS } from "@/lib/game/scoring";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/game/Avatar";
import { AchievementBadge } from "@/components/game/AchievementBadge";
import { CategoryMastery, OverallMastery } from "@/components/game/CategoryMastery";
import { type Achievement } from "@/lib/achievements";

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

  // Fetch user achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      achievement_id,
      unlocked_at,
      achievements (*)
    `)
    .eq("user_id", user.id);

  // Fetch all achievements for display
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("category", { ascending: true });

  const levelInfo = profile ? getLevelFromXP(profile.xp || 0) : null;

  // Map unlocked achievements
  const unlockedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || []);
  const achievementsWithStatus = (allAchievements || []).map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    unlockedAt: userAchievements?.find((ua) => ua.achievement_id === a.id)?.unlocked_at,
  }));

  // Calculate category stats
  const categories = ["agents", "commands", "hooks", "config"];
  const categoryStats = categories.map((cat) => {
    const progress = categoryProgress?.find((p) => p.category === cat);
    return {
      category: cat,
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

      {/* User info with Avatar */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col items-center mb-4">
          {/* Avatar - Click to customize */}
          <Link href="/equipment" className="hover:scale-105 transition-transform">
            <Avatar
              xp={profile?.xp || 0}
              loadout={profile?.loadout || { armor: "knight", weapon: "sword", shield: "tower" }}
              size="lg"
              showTier={true}
              showProgress={true}
            />
          </Link>
          <Link
            href="/equipment"
            className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors"
          >
            ⚙️ Customize Equipment
          </Link>
          <h2 className="text-xl font-bold mt-2">
            {profile?.username || user.email}
          </h2>
          <p className="text-slate-400">{levelInfo?.title || "Newcomer"}</p>
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

      {/* Overall Mastery */}
      <div className="mb-6">
        <OverallMastery progress={categoryStats} />
      </div>

      {/* Category progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Category Progress</h3>
        <CategoryMastery progress={categoryStats} />
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          Achievements ({unlockedIds.size}/{achievementsWithStatus.length})
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {achievementsWithStatus.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement as Achievement}
              unlocked={achievement.unlocked}
              unlockedAt={achievement.unlockedAt}
              size="sm"
              showDetails={false}
            />
          ))}
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
