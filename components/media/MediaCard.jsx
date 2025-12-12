"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";

/**
 * @param {{ item: any }} props
 * item can be Movie or Show: expects fields { id, title|name, poster_path, release_date|first_air_date, vote_average }
 */
export default function MediaCard({ item }) {
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date || "";
  const year = date ? new Date(date).getFullYear() : "—";
  const rating =
    typeof item.vote_average === "number"
      ? item.vote_average.toFixed(1)
      : "N/A";
  const poster = getImageUrl(item.poster_path, "w342");

  return (
    <Link href={`/title/${item.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-sm transition-shadow">
        {poster ? (
          <div className="relative aspect-2/3">
            <Image
              src={poster}
              alt={`${title} poster`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              priority
              fetchPriority="high"
              loading="eager"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-2/3 bg-muted" />
        )}
        <CardHeader className="py-3">
          <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between py-0 pb-3">
          <span className="text-sm text-muted-foreground">{year}</span>
          <Badge variant="secondary" className="inline-flex items-center gap-1">
            <Star
              className="h-3.5 w-3.5"
              fill="currentColor"
              aria-hidden="true"
            />{" "}
            {rating}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
