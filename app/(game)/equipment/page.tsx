"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EquipmentSelector } from "@/components/game/EquipmentSelector";
import { DEFAULT_LOADOUT, type Loadout } from "@/lib/avatar";

export default function EquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    xp: number;
    loadout: Loadout | null;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, xp, loadout")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          xp: data.xp || 0,
          loadout: data.loadout as Loadout | null,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSaveLoadout = async (loadout: Loadout) => {
    if (!profile) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ loadout })
      .eq("id", profile.id);

    if (error) {
      console.error("Failed to save loadout:", error);
      throw error;
    }

    // Update local state
    setProfile((prev) => (prev ? { ...prev, loadout } : null));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-slate-400">Loading your equipment...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4">Sign in to customize your avatar</p>
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/profile"
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Equipment</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </header>

      {/* Tier info */}
      <div className="text-center mb-6">
        <p className="text-slate-400 text-sm">
          Your equipment tier is based on your XP
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Earn more XP to upgrade to higher tiers with better visuals!
        </p>
      </div>

      {/* Equipment selector */}
      <EquipmentSelector
        xp={profile.xp}
        currentLoadout={profile.loadout || DEFAULT_LOADOUT}
        onSave={handleSaveLoadout}
      />

      {/* XP info */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-xl">
        <h3 className="font-semibold mb-2">Tier Progression</h3>
        <div className="space-y-1 text-sm text-slate-400">
          <p>
            <span className="text-gray-400">●</span> Common: 0 XP
          </p>
          <p>
            <span className="text-green-400">●</span> Uncommon: 200 XP
          </p>
          <p>
            <span className="text-blue-400">●</span> Rare: 800 XP
          </p>
          <p>
            <span className="text-purple-400">●</span> Epic: 2,500 XP
          </p>
          <p>
            <span className="text-amber-400">●</span> Legendary: 6,000 XP
          </p>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Current XP: <span className="text-white font-semibold">{profile.xp}</span>
        </p>
      </div>
    </main>
  );
}
