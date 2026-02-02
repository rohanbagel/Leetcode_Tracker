"use client";

import { FiX, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentUsers({ users = [], onSelect, onRemove }) {
  if (users.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Users
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1">
          {users.map((username) => (
            <li
              key={username}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
            >
              <button
                onClick={() => onSelect(username)}
                className="flex items-center gap-2 flex-1 text-left font-mono text-sm"
              >
                <FiUser className="h-4 w-4 text-muted-foreground" />
                {username}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(username);
                }}
                aria-label={`Remove ${username}`}
              >
                <FiX className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
