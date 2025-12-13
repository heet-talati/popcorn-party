"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProfileHeader({
  userDoc,
  stats = {},
  isOwner,
  user,
  following,
  onToggleFollow,
  followBusy,
}) {
  const username = userDoc?.username || "profile";
  const watchedMovies = stats.watchedMovies ?? 0;
  const watchedShows = stats.watchedShows ?? 0;
  const totalWatched = stats.totalWatched ?? watchedMovies + watchedShows;
  const canFollow = !!user && !isOwner;

  return (
    <header className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">@{username}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">Total Watched: {totalWatched}</Badge>
          <Badge variant="outline">Movies: {watchedMovies}</Badge>
          <Badge variant="outline">Shows: {watchedShows}</Badge>
        </div>
      </div>
      {canFollow ? (
        <Button
          variant={following ? "secondary" : "default"}
          onClick={onToggleFollow}
          disabled={followBusy}
          aria-pressed={following}
          aria-label={following ? "Unfollow this profile" : "Follow this profile"}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      ) : null}
    </header>
  );
}
