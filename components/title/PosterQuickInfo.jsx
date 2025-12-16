"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function PosterQuickInfo({ poster, title, vote, year }) {
  return (
    <div>
      {poster ? (
        <div className="relative aspect-2/3 rounded-md overflow-hidden">
          <Image
            src={poster}
            alt={`${title} poster`}
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            loading="eager"
            priority
            fetchPriority="high"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-2/3 bg-muted rounded-md" />
      )}
      <div className="mt-3 flex items-center justify-between">
        <Badge className="inline-flex items-center gap-1">
          <Star
            className="h-3.5 w-3.5"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
          />
          {vote}
        </Badge>
        <Badge>{year}</Badge>
      </div>
    </div>
  );
}
