"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiCode, FiArrowLeft } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserStats } from "@/components/user-stats";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function UserPage() {
  const params = useParams();
  const username = params.username;

  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add to recent users in localStorage after mount
  useEffect(() => {
    if (username) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("recentLeetcodeUsers") || "[]"
        );
        const updated = [username, ...stored.filter((u) => u !== username)].slice(
          0,
          10
        );
        localStorage.setItem("recentLeetcodeUsers", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update recent users", e);
      }
    }
  }, [username]);

  // Fetch data for this user
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if Supabase is configured
    if (!supabase) {
      setError("Database not configured. Please set up Supabase environment variables.");
      setLoading(false);
      return;
    }

    try {
      const { data: snapshotData, error: snapError } = await supabase
        .from("leetcode_snapshot")
        .select("*")
        .eq("username", username)
        .single();

      if (snapError && snapError.code !== "PGRST116") {
        console.error("Snapshot error:", snapError);
      }

      const { data: historyData } = await supabase
        .from("solve_history")
        .select("*")
        .eq("username", username)
        .order("solved_at", { ascending: false })
        .limit(10);

      const { data: syncHistoryData } = await supabase
        .from("sync_history")
        .select("*")
        .eq("username", username)
        .order("synced_at", { ascending: false })
        .limit(10);

      setSnapshot(snapshotData);
      setHistory(historyData || []);
      setSyncHistory(syncHistoryData || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data");
    }

    setLoading(false);
  }, [username]);

  // Trigger sync for this user
  const triggerSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sync?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Sync failed");
      } else if (data.success && data.snapshot) {
        setSnapshot(data.snapshot);
      }

      await fetchData();
    } catch (err) {
      console.error("Sync error:", err);
      setError("Network error during sync");
    }

    setSyncing(false);
  };

  // Initial data fetch and auto-sync if no data exists
  useEffect(() => {
    if (username && !hasFetched.current) {
      hasFetched.current = true;
      
      const initializeUser = async () => {
        setLoading(true);
        setError(null);

        // Check if Supabase is configured
        if (!supabase) {
          setError("Database not configured. Please set up Supabase environment variables.");
          setLoading(false);
          return;
        }

        try {
          // First check if user data exists
          const { data: snapshotData, error: snapError } = await supabase
            .from("leetcode_snapshot")
            .select("*")
            .eq("username", username)
            .single();

          if (snapError && snapError.code !== "PGRST116") {
            console.error("Snapshot error:", snapError);
          }

          // If no data exists, auto-sync from LeetCode API
          if (!snapshotData) {
            setSyncing(true);
            try {
              const response = await fetch(
                `/api/sync?username=${encodeURIComponent(username)}`
              );
              const data = await response.json();

              if (!response.ok) {
                setError(data.error || "Failed to fetch LeetCode data");
              } else if (data.success && data.snapshot) {
                setSnapshot(data.snapshot);
              }
            } catch (err) {
              console.error("Auto-sync error:", err);
              setError("Network error while fetching stats");
            }
            setSyncing(false);
          }

          // Now fetch all data from database
          await fetchData();
        } catch (err) {
          console.error("Init error:", err);
          setError("Failed to initialize");
          setLoading(false);
        }
      };

      initializeUser();
    }
  }, [username, fetchData]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FiCode className="h-6 w-6" />
            <span className="font-bold text-lg">LC Tracker</span>
          </div>
          <nav className="space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Search
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-6 space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <p className="text-xs text-muted-foreground">
            Viewing: <span className="font-bold">{username}</span>
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-background z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <FiArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-bold">{username}</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-14">
        <div className="container max-w-4xl mx-auto p-6 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {username}&apos;s Progress
            </h1>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>

          {/* Stats */}
          <UserStats
            username={username}
            snapshot={snapshot}
            history={history}
            syncHistory={syncHistory}
            loading={loading}
            syncing={syncing}
            onSync={triggerSync}
            formatDate={formatDate}
          />
        </div>
      </main>
    </div>
  );
}
