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

export default function WatchlistItem({ item }) {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const tmdbId = item?.tmdbId;
      if (!tmdbId) {
        if (active) setMeta(null);
        return;
      }
      try {
        const fetcher = item?.mediaType === "tv" ? getShowDetails : getMovieDetails;
        const data = await fetcher(tmdbId);
        if (active) setMeta(data || null);
      } catch {
        if (active) setMeta(null);
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

  return (
    <Link href={`/title/${item?.tmdbId}`} className="block h-full">
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
          ) : null}
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
