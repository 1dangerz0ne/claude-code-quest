"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface ActivityItem {
  id: string;
  type: string;
  username?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Live activity counter showing real-time player activity
export function LiveCounter() {
  const [playersNow, setPlayersNow] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial counts
    const fetchCounts = async () => {
      // Get games completed in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { count } = await supabase
        .from("game_sessions")
        .select("*", { count: "exact", head: true })
        .gte("completed_at", fiveMinutesAgo);

      setPlayersNow(count || 0);

      // Get recent activity
      const { data: activity } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (activity) {
        setRecentActivity(activity);
      }
    };

    fetchCounts();

    // Subscribe to real-time activity updates
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          setRecentActivity((prev) => [payload.new as ActivityItem, ...prev.slice(0, 4)]);
          setPlayersNow((prev) => prev + 1);
        }
      )
      .subscribe();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchCounts, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="text-center">
      {/* Live indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-sm text-slate-300">
          <span className="font-bold text-white">{playersNow}</span> playing now
        </span>
      </div>
    </div>
  );
}

// Activity feed showing recent actions
export function ActivityFeed({ limit = 5 }: { limit?: number }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activity_log")
        .select(`
          *,
          profiles(username)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data) {
        setActivities(
          data.map((item) => ({
            ...item,
            username: item.profiles?.username || "Someone",
          }))
        );
      }
    };

    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel("activity-feed-full")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        () => {
          fetchActivities(); // Refetch to get username
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const getActivityMessage = (activity: ActivityItem): string => {
    switch (activity.type) {
      case "game_complete":
        return `completed a game`;
      case "achievement_unlock":
        return `unlocked "${(activity.metadata as { achievement_name?: string })?.achievement_name || "an achievement"}"`;
      case "level_up":
        return `reached level ${(activity.metadata as { level?: number })?.level || "?"}`;
      case "challenge_created":
        return `created a challenge`;
      default:
        return `did something awesome`;
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2"
          >
            <span className="text-blue-400 font-medium truncate max-w-[100px]">
              {activity.username}
            </span>
            <span className="truncate">{getActivityMessage(activity)}</span>
            <span className="text-slate-600 ml-auto text-xs whitespace-nowrap">
              {getTimeAgo(activity.created_at)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Compact stat counter with animation
export function AnimatedCounter({
  value,
  label,
  color = "blue",
}: {
  value: number;
  label: string;
  color?: "blue" | "green" | "orange" | "yellow";
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate counting up
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    blue: "text-blue-400",
    green: "text-green-400",
    orange: "text-orange-400",
    yellow: "text-yellow-400",
  };

  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {displayValue.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
