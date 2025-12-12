"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

/**
 * FeedItem
 * Displays a single activity feed line for a user and title.
 * Props:
 *  - item: object containing activity details (tmdbId, title, name, rating, status, userName, userId)
 * Behavior:
 *  - Attempts to resolve a human-friendly title from TMDB using `item.tmdbId`.
 *  - Shows a star icon when `item.rating` is a number, otherwise shows the `item.status`.
 */
export default function FeedItem({ item }) {
  // Title resolved from TMDB (async) or falls back to provided title/name/id
  const [fetchedTitle, setFetchedTitle] = useState(null);
  useEffect(() => {
    // `active` prevents setting state after unmount
    let active = true;
    async function run() {
      const id = item?.tmdbId;
      if (!id) return; // nothing to fetch
      try {
        // Dynamically import TMDB service to avoid loading it on every page
        const mod = await import("@/services/tmdb");
        try {
          // Try movie details first
          const m = await mod.getMovieDetails(id);
          if (active) setFetchedTitle(m?.title || null);
          return;
        } catch { }
        try {
          // If not a movie, try show details
          const tv = await mod.getShowDetails(id);
          if (active) setFetchedTitle(tv?.name || null);
        } catch { }
      } catch { }
    }
    run();
    return () => {
      active = false;
    };
  }, [item?.tmdbId]);
  const title = fetchedTitle || item.title || item.name || String(item.tmdbId);
  const hasRating = typeof item.rating === "number";
  return (
    <div className="text-sm">
      <span className="font-medium">{item.userName || item.userId}</span>{" "}
      {hasRating ? (
        <>
          rated {item.rating}{" "}
          <Star
            className="inline h-3.5 w-3.5 align-text-bottom text-primary"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
          />{" "}
        </>
      ) : (
        item.status
      )}{" "}
      <Link
        href={`/title/${item.tmdbId}`}
        className="underline hover:no-underline"
      >
        {title}
      </Link>
    </div>
  );
}
