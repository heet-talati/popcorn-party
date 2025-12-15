"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersSidebar from "@/components/search/FiltersSidebar";
import ResultsGrid from "@/components/search/ResultsGrid";
import {
  searchMulti,
  getTrending,
  getByGenre,
  discoverMovies,
} from "@/services/tmdb";

const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [debounced, setDebounced] = useState("");
  const DEFAULT_YEAR_MIN = 1990;
  const DEFAULT_YEAR_MAX = new Date().getFullYear();
  const DEFAULT_RATING_MIN = 5;
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const g = searchParams.get("genres");
    if (!g) return [];
    return g
      .split(",")
      .map((x) => Number(x))
      .filter((n) => !Number.isNaN(n));
  });
  const [yearMin, setYearMin] = useState(
    () => Number(searchParams.get("ymin")) || DEFAULT_YEAR_MIN
  );
  const [yearMax, setYearMax] = useState(
    () => Number(searchParams.get("ymax")) || DEFAULT_YEAR_MAX
  );
  const [rating, setRating] = useState(() => {
    const r = searchParams.get("rating");
    return [r ? Number(r) : DEFAULT_RATING_MIN];
  });

  useEffect(() => {
    const q = searchParams.get("q");
    const g = searchParams.get("genres");
    const ymin = searchParams.get("ymin");
    const ymax = searchParams.get("ymax");
    const r = searchParams.get("rating");
    if (q) setQuery(q);
    if (g) {
      const arr = g
        .split(",")
        .map((x) => Number(x))
        .filter((n) => !Number.isNaN(n));
      if (arr.length) setSelectedGenres(arr);
    }
    if (ymin) setYearMin(Number(ymin));
    if (ymax) setYearMax(Number(ymax));
    if (r) setRating([Number(r)]);
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (selectedGenres.length > 0)
      params.set("genres", selectedGenres.join(","));
    // Only persist non-default filters to URL so default state doesn't count as filtering
    if (yearMin !== DEFAULT_YEAR_MIN) params.set("ymin", String(yearMin));
    if (yearMax !== DEFAULT_YEAR_MAX) params.set("ymax", String(yearMax));
    if (typeof rating[0] === "number" && rating[0] !== DEFAULT_RATING_MIN)
      params.set("rating", String(rating[0]));
    const qs = params.toString();
    const current = searchParams.toString();
    if (qs !== current) {
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    }
    setPage(1);
  }, [
    debounced,
    selectedGenres,
    yearMin,
    yearMax,
    rating,
    router,
    searchParams,
    DEFAULT_YEAR_MAX,
    DEFAULT_YEAR_MIN,
    DEFAULT_RATING_MIN,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      const cleaned = query.trim().slice(0, 100); // cap length to avoid excessively long URLs
      setDebounced(cleaned);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        let data;
        // Consider filters active only if they are explicitly present in URL or genres selected
        const hasFilters =
          selectedGenres.length > 0 ||
          searchParams.has("rating") ||
          searchParams.has("ymin") ||
          searchParams.has("ymax");
        if (debounced) {
          data = await searchMulti(debounced, { page });
        } else if (hasFilters) {
          const params = { page, include_adult: false };
          if (selectedGenres.length > 0)
            params.with_genres = selectedGenres.join(",");
          if (typeof rating[0] === "number")
            params["vote_average.gte"] = rating[0];
          if (searchParams.has("ymin"))
            params["primary_release_date.gte"] = `${yearMin}-01-01`;
          if (searchParams.has("ymax"))
            params["primary_release_date.lte"] = `${yearMax}-12-31`;
          data = await discoverMovies(params);
        } else {
          data = await getTrending("movie", "day", page);
        }
        const filtered = (data?.results || []).filter((r) => {
          const mediaType =
            r.media_type || (r.title ? "movie" : r.name ? "tv" : "person");
          if (mediaType === "person") return false;
          const year = new Date(
            r.release_date || r.first_air_date || ""
          ).getFullYear();
          const votes = typeof r.vote_average === "number" ? r.vote_average : 0;
          const genreIds = r.genre_ids || [];
          if (selectedGenres.length > 0 && mediaType !== "movie") return false;
          const matchGenre =
            selectedGenres.length === 0 ||
            selectedGenres.some((g) => genreIds.includes(g));
          const matchYear = !year || (year >= yearMin && year <= yearMax);
          const matchRating = votes >= rating[0];
          return matchGenre && matchYear && matchRating;
        });
        if (active) {
          setTotalPages(data?.total_pages || 1);
          setItems((prev) => {
            const merged = page === 1 ? filtered : [...prev, ...filtered];
            const seen = new Set();
            const deduped = [];
            for (const it of merged) {
              const type =
                it.media_type ||
                (it.title ? "movie" : it.name ? "tv" : "person");
              const key = `${type}-${it.id}`;
              if (!seen.has(key)) {
                seen.add(key);
                deduped.push(it);
              }
            }
            return deduped;
          });
        }
      } catch (e) {
        console.error(e);
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [debounced, selectedGenres, yearMin, yearMax, rating, page, searchParams]);

  const genreLabel = useMemo(() => {
    return selectedGenres.length
      ? getByGenre(selectedGenres, "movie").join(", ")
      : "All Genres";
  }, [selectedGenres]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      <FiltersSidebar
        query={query}
        setQuery={setQuery}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        yearMin={yearMin}
        setYearMin={setYearMin}
        yearMax={yearMax}
        setYearMax={setYearMax}
        rating={rating}
        setRating={setRating}
        MOVIE_GENRES={MOVIE_GENRES}
        genreLabel={genreLabel}
      />

      <ResultsGrid
        items={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onLoadMore={() => setPage((p) => p + 1)}
        isTrending={
          !debounced &&
          !(
            selectedGenres.length > 0 ||
            searchParams.has("rating") ||
            searchParams.has("ymin") ||
            searchParams.has("ymax")
          )
        }
      />
    </div>
  );
}
