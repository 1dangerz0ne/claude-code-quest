import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getTodayDateString } from "@/lib/game/questions";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const todayDate = getTodayDateString();

  // Fetch today's leaderboard
  const { data: results } = await supabase
    .from("daily_results")
    .select(
      `
      *,
      profiles:user_id (username)
    `
    )
    .eq("challenge_date", todayDate)
    .order("score", { ascending: false })
    .limit(20);

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-slate-400 text-sm">{todayDate}</p>
        </div>
        <Link
          href="/play"
          className="px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          Back
        </Link>
      </header>

      {/* Today's player count */}
      {results && results.length > 0 && (
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">
            <span className="text-green-400">●</span>
            {results.length} player{results.length !== 1 ? "s" : ""} completed today
          </span>
        </div>
      )}

      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        <button className="flex-1 py-3 bg-orange-600 rounded-xl font-medium">
          Today
        </button>
        <button className="flex-1 py-3 bg-slate-800 rounded-xl font-medium text-slate-400">
          All Time
        </button>
      </div>

      {/* Leaderboard list */}
      <div className="flex-1">
        {!results || results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏆</div>
            <p className="text-slate-400 mb-4">
              No scores yet today. Be the first!
            </p>
            <Link
              href="/daily"
              className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-medium transition-colors"
            >
              Play Daily Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => {
              const isCurrentUser = user && result.user_id === user.id;
              const username =
                (result.profiles as { username?: string })?.username ||
                "Anonymous";

              return (
                <div
                  key={result.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    isCurrentUser
                      ? "bg-blue-900/30 border border-blue-700"
                      : "bg-slate-800"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                          ? "bg-slate-400 text-black"
                          : index === 2
                            ? "bg-orange-700 text-white"
                            : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <p className="font-medium">
                      {username}
                      {isCurrentUser && (
                        <span className="text-blue-400 text-sm ml-2">You</span>
                      )}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {result.correct}/{result.total} correct
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-400">
                      {result.score}
                    </p>
                    <p className="text-slate-500 text-xs">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA if not played yet */}
      {user && results && !results.find((r) => r.user_id === user.id) && (
        <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center">
          <p className="text-slate-300 mb-3">
            You haven&apos;t played today&apos;s challenge yet!
          </p>
          <Link
            href="/daily"
            className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-medium transition-colors"
          >
            Play Now
          </Link>
        </div>
      )}
    </main>
  );
}
