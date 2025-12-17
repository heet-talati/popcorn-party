"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getImageUrl,
  getMovieDetails,
  getShowDetails,
} from "@/services/tmdb";

export default function WatchingItem({ item }) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const tmdbId = item?.tmdbId;
      if (!tmdbId) {
        if (active) {
          setMeta(null);
          setLoading(false);
        }
        return;
      }
      if (active) setLoading(true);
      try {
        const fetcher = item?.mediaType === "tv" ? getShowDetails : getMovieDetails;
        const data = await fetcher(tmdbId);
        if (active) {
          setMeta(data || null);
          setLoading(false);
        }
      } catch (error) {
        console.error(`WatchingItem: Failed to fetch ${item?.mediaType} ${tmdbId}:`, error);
        if (active) {
          setMeta(null);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [item?.mediaType, item?.tmdbId]);

  const title =
    meta?.title ||
    meta?.name ||
    item?.title ||
    item?.name ||
    `#${item?.tmdbId ?? "unknown"}`;
  const poster = getImageUrl(meta?.poster_path, "w342");

  const linkType =
    item?.mediaType || (meta?.title ? "movie" : meta?.name ? "tv" : "movie");

  return (
    <Link href={`/title/${item?.tmdbId}?type=${linkType}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-sm">
        <div className="relative aspect-2/3 bg-muted">
          {poster ? (
            <Image
              src={poster}
              alt={`${title} poster`}
              fill
              sizes="160px"
              priority
              fetchPriority="high"
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted-foreground p-2">
              {loading ? "Loading..." : "No Image"}
            </div>
          )}
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
            {title}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
