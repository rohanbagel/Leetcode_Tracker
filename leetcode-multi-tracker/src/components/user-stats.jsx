"use client";

import { FiRefreshCw, FiTrendingUp, FiAward, FiPercent } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Progress Bar Component
function ProgressBar({ label, solved, total, color }) {
  const percentage = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-muted-foreground">
          {solved} / {total}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Empty State
function EmptyState({ username, onSync, syncing }) {
  return (
    <Card>
      <CardContent className="py-10 text-center space-y-4">
        <p className="text-muted-foreground">
          No data found for <span className="font-mono font-bold">{username}</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          Click the button below to fetch the latest stats from LeetCode.
        </p>
        <Button onClick={onSync} disabled={syncing} className="mt-4">
          <FiRefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Fetching Stats..." : "Fetch Stats"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function UserStats({
  username,
  snapshot,
  history = [],
  syncHistory = [],
  loading,
  syncing,
  onSync,
  formatDate,
}) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!snapshot) {
    return <EmptyState username={username} onSync={onSync} syncing={syncing} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Sync Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatDate(snapshot.updated_at)}
          </p>
        </div>
        <Button onClick={onSync} disabled={syncing} variant="outline">
          <FiRefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Solved"
          value={snapshot.total_solved}
          subtitle={`of ${snapshot.total_easy + snapshot.total_medium + snapshot.total_hard} problems`}
          icon={FiTrendingUp}
        />
        <StatCard
          title="Easy"
          value={snapshot.easy_solved}
          subtitle={`of ${snapshot.total_easy}`}
        />
        <StatCard
          title="Medium"
          value={snapshot.medium_solved}
          subtitle={`of ${snapshot.total_medium}`}
        />
        <StatCard
          title="Hard"
          value={snapshot.hard_solved}
          subtitle={`of ${snapshot.total_hard}`}
        />
      </div>

      {/* Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress by Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar
            label="Easy"
            solved={snapshot.easy_solved}
            total={snapshot.total_easy}
            color="bg-green-500"
          />
          <ProgressBar
            label="Medium"
            solved={snapshot.medium_solved}
            total={snapshot.total_medium}
            color="bg-yellow-500"
          />
          <ProgressBar
            label="Hard"
            solved={snapshot.hard_solved}
            total={snapshot.total_hard}
            color="bg-red-500"
          />
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Ranking"
          value={snapshot.ranking?.toLocaleString() || "N/A"}
          icon={FiAward}
        />
        <StatCard
          title="Acceptance Rate"
          value={`${snapshot.acceptance_rate?.toFixed(1) || 0}%`}
          icon={FiPercent}
        />
        <StatCard
          title="Last Delta"
          value={snapshot.last_delta > 0 ? `+${snapshot.last_delta}` : snapshot.last_delta}
          subtitle="problems since last sync"
          icon={FiTrendingUp}
        />
      </div>

      {/* Recent Solves */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Solve Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {history.map((item, index) => (
                <li key={item.id || index}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">
                      +{item.problems_solved} solved
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.solved_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total at time: {item.total_at_time}
                  </p>
                  {index < history.length - 1 && <Separator className="mt-3" />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Syncs */}
      {syncHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {syncHistory.slice(0, 5).map((item, index) => (
                <li key={item.id || index}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">
                      {item.total_solved} total ({item.easy_solved}E / {item.medium_solved}M / {item.hard_solved}H)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.synced_at)}
                    </span>
                  </div>
                  {index < Math.min(syncHistory.length, 5) - 1 && <Separator className="mt-3" />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
