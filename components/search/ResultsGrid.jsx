"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import MediaCard from "@/components/media/MediaCard";

export default function ResultsGrid({
  items,
  loading,
  page,
  totalPages,
  onLoadMore,
  isTrending,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-2/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        data-testid={isTrending ? "trending-grid" : "results-grid"}
      >
        {items.map((item) => {
          const type =
            item.media_type || (item.title ? "movie" : item.name ? "tv" : "person");
          return <MediaCard key={`${type}-${item.id}`} item={item} />;
        })}
        {items.length === 0 && (
          <p className="text-muted-foreground">No results match the filters.</p>
        )}
      </div>
      {items.length > 0 && page < totalPages && (
        <div className="flex justify-center mt-6">
          <Button onClick={onLoadMore}>Load more</Button>
        </div>
      )}
    </section>
  );
}
