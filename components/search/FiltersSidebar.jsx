"use client";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FiltersSidebar({
  query,
  setQuery,
  selectedGenres,
  setSelectedGenres,
  yearMin,
  setYearMin,
  yearMax,
  setYearMax,
  rating,
  setRating,
  MOVIE_GENRES,
  genreLabel,
}) {
  return (
    <aside className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies or shows..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Genre</label>
            <div className="flex flex-wrap gap-2">
              {MOVIE_GENRES.map((g) => {
                const active = selectedGenres.includes(g.id);
                return (
                  <Button
                    key={g.id}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedGenres((prev) =>
                        prev.includes(g.id)
                          ? prev.filter((id) => id !== g.id)
                          : [...prev, g.id]
                      );
                    }}
                  >
                    {g.name}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{genreLabel}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Release Year</label>
            <div className="flex items-center gap-2">
              <Input
                aria-label="minimum-year"
                type="number"
                value={yearMin}
                onChange={(e) => setYearMin(Number(e.target.value))}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                aria-label="maximum-year"
                type="number"
                value={yearMax}
                onChange={(e) => setYearMax(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating (min)</label>
            <Slider
              value={rating}
              onValueChange={setRating}
              min={0}
              max={10}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">
              {rating[0].toFixed(1)}
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
