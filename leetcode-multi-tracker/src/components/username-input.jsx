"use client";

import { useState } from "react";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UsernameInput({ onSubmit, loading = false, placeholder = "Enter LeetCode username" }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username");
      return;
    }

    // Validate username format (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <Input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder={placeholder}
          disabled={loading}
          className="font-mono"
        />
        <Button type="submit" disabled={loading || !username.trim()} size="icon">
          {loading ? (
            <FiLoader className="h-4 w-4 animate-spin" />
          ) : (
            <FiArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
