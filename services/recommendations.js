import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import {
    getMovieDetails,
    discoverMovies,
    getMovieRecommendations,
} from "@/services/tmdb";

// Helper: aggregate top genres from watched rated movies
async function getTopGenresForUser(userId, max = 3) {
    const q = query(
        collection(db, "user_activity"),
        where("userId", "==", userId),
        where("mediaType", "==", "movie"),
        where("status", "==", "watched"),
        limit(200)
    );
    const snap = await getDocs(q);
    const genreScores = new Map();
    const detailsCache = new Map();
    for (const d of snap.docs) {
        const a = d.data();
        if (!a.tmdbId) continue;
        const id = a.tmdbId;
        let details = detailsCache.get(id);
        if (!details) {
            try {
                details = await getMovieDetails(id);
                detailsCache.set(id, details);
            } catch {
                continue;
            }
        }
        const genres = details?.genres || [];
        for (const g of genres) {
            const prev = genreScores.get(g.id) || {
                id: g.id,
                name: g.name,
                score: 0,
                count: 0,
            };
            prev.score += typeof a.rating === "number" ? a.rating : 1;
            prev.count += 1;
            genreScores.set(g.id, prev);
        }
    }
    return Array.from(genreScores.values())
        .map((g) => ({ ...g, avg: g.count ? g.score / g.count : 0 }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, max);
}

// Helper: get top rated watched movies
async function getTopRatedMovies(userId, max = 3) {
    const q = query(
        collection(db, "user_activity"),
        where("userId", "==", userId),
        where("mediaType", "==", "movie"),
        where("status", "==", "watched"),
        limit(200)
    );
    const snap = await getDocs(q);
    const rated = [];
    const unrated = [];
    for (const d of snap.docs) {
        const a = d.data();
        if (!a.tmdbId) continue;
        if (typeof a.rating === "number") rated.push(a);
        else unrated.push(a);
    }
    // Sort rated by rating desc
    rated.sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0));
    // Fallback: if no rated, use most recent watched by timestamp
    if (rated.length === 0 && unrated.length > 0) {
        unrated.sort((x, y) => {
            const xt = x.timestamp?.seconds || 0;
            const yt = y.timestamp?.seconds || 0;
            return yt - xt;
        });
    }
    const picked = (rated.length > 0 ? rated : unrated).slice(0, max);
    const movies = [];
    for (const a of picked) {
        try {
            const details = await getMovieDetails(a.tmdbId);
            movies.push(details);
        } catch {
            // ignore fetch error
        }
    }
    return movies;
}

// Helper: watched movie IDs to exclude
async function getWatchedMovieIds(userId) {
    const q = query(
        collection(db, "user_activity"),
        where("userId", "==", userId),
        where("mediaType", "==", "movie"),
        where("status", "==", "watched")
    );
    const snap = await getDocs(q);
    const ids = new Set();
    for (const d of snap.docs) {
        const a = d.data();
        if (a.tmdbId) ids.add(a.tmdbId);
    }
    return Array.from(ids);
}

export async function getForYouRecommendations(userId) {
    if (!userId)
        return { interestBased: [], becauseYouWatched: [], topMovie: null };

    let topGenres, topMovies, watchedIds;
    try {
        [topGenres, topMovies, watchedIds] = await Promise.all([
            getTopGenresForUser(userId, 3),
            getTopRatedMovies(userId, 3),
            getWatchedMovieIds(userId),
        ]);
    } catch {
        return { interestBased: [], becauseYouWatched: [], topMovie: null };
    }

    if ((topGenres?.length || 0) === 0 && (topMovies?.length || 0) === 0) {
        return { interestBased: [], becauseYouWatched: [], topMovie: null };
    }

    // Genre-based suggestions
    let interestBased = [];
    for (const g of topGenres) {
        try {
            const res = await discoverMovies({ with_genres: String(g.id), page: 1 });
            const filtered = (res?.results || []).filter(
                (m) => !watchedIds.includes(m.id)
            );
            interestBased.push(...filtered.slice(0, 6));
        } catch {
            // ignore per genre
        }
    }
    // Deduplicate
    const seen = new Set();
    interestBased = interestBased.filter((m) =>
        seen.has(m.id) ? false : (seen.add(m.id), true)
    );

    // Because you watched (top rated movie)
    let becauseYouWatched = [];
    let topMovie = topMovies[0] || null;
    if (topMovie?.id) {
        try {
            const rec = await getMovieRecommendations(topMovie.id);
            becauseYouWatched = (rec?.results || [])
                .filter((m) => !watchedIds.includes(m.id))
                .slice(0, 12);
        } catch {
            becauseYouWatched = [];
        }
    }

    return { interestBased, becauseYouWatched, topMovie, topGenres };
}