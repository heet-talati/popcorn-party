// Simple service placeholder for movie API calls
// Replace with real API (e.g., TMDB) later.

const BASE_URL = "https://example.com/api";

export async function searchMovies(query) {
    const res = await fetch(
        `${BASE_URL}/movies?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Failed to fetch movies");
    return res.json();
}

export async function getMovie(id) {
    const res = await fetch(`${BASE_URL}/movies/${id}`);
    if (!res.ok) throw new Error("Failed to fetch movie");
    return res.json();
}