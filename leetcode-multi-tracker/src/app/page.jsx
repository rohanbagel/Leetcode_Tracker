"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiCode, FiGithub } from "react-icons/fi";
import { ThemeToggle } from "@/components/theme-toggle";
import { UsernameInput } from "@/components/username-input";
import { RecentUsers } from "@/components/recent-users";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const router = useRouter();
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load recent users from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentLeetcodeUsers");
      if (stored) {
        setRecentUsers(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Navigate to user page on submit
  const handleSubmit = (username) => {
    setLoading(true);
    router.push(`/user/${username}`);
  };

  // Handle selecting a recent user
  const handleSelectUser = (username) => {
    router.push(`/user/${username}`);
  };

  // Handle removing a recent user
  const handleRemoveUser = (username) => {
    const updated = recentUsers.filter((u) => u !== username);
    setRecentUsers(updated);
    localStorage.setItem("recentLeetcodeUsers", JSON.stringify(updated));
  };

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
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm font-medium"
            >
              Dashboard
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
            Track any LeetCode user
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-background z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FiCode className="h-5 w-5" />
          <span className="font-bold">LC Tracker</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-14">
        <div className="container max-w-4xl mx-auto p-6 md:p-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">LeetCode Tracker</h1>
            <p className="text-muted-foreground">
              Enter any LeetCode username to view their progress and statistics.
            </p>
          </div>

          {/* Username Input */}
          <div className="mb-8">
            <UsernameInput onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Recent Users */}
          <RecentUsers
            users={recentUsers}
            onSelect={handleSelectUser}
            onRemove={handleRemoveUser}
          />

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              Stats powered by{" "}
              <a
                href="https://github.com/JeremyTsaii/leetcode-stats-api"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                LeetCode Stats API
                <FiGithub className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
