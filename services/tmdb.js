// TMDb Service Layer
// Uses TMDb v3 API with an API key. Set `NEXT_PUBLIC_TMDB_API_KEY` in your env.

/**
 * Base TMDb v3 API URL.
 * @type {string}
 */
const BASE_URL = "https://api.themoviedb.org/3";
/**
 * Public TMDb API key from environment. Exposed to client.
 * @type {string|undefined}
 */
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

/**
 * Build a full TMDb request URL with query parameters.
 * @param {string} path - API path starting with `/`, e.g. `/search/multi`.
 * @param {Record<string, string|number|boolean>} [params] - Query params to append.
 * @returns {string} Full URL string.
 */
function buildUrl(path, params = {}) {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("api_key", API_KEY ?? "");
    // Default language can be overridden via params
    if (!params.language) url.searchParams.set("language", "en-US");
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
    }
    return url.toString();
}

/**
 * Perform a fetch to TMDb with sane defaults and error handling.
 * @param {string} path - API path starting with `/`.
 * @param {Record<string, string|number|boolean>} [params] - Query params.
 * @param {RequestInit & { next?: any }} [options] - Fetch options, supports Next.js `next`.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} On non-2xx response.
 */
async function doFetch(path, params = {}, options = {}) {
    const url = buildUrl(path, params);
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`TMDb request failed ${res.status}: ${text}`);
    }
    return res.json();
}

/**
 * Search across movies, TV shows, and people.
 * @param {string} query - Free text query to search.
 * @param {object} [opts]
 * @param {number} [opts.page=1] - Page number.
 * @returns {Promise<{ page:number, results:Array<(Movie|Show|Person)>, total_results:number, total_pages:number }>} TMDb multi-search response.
 *
 * Movie: { id:number, title:string, poster_path:string|null, release_date:string, overview:string, media_type:"movie" }
 * Show: { id:number, name:string, poster_path:string|null, first_air_date:string, overview:string, media_type:"tv" }
 * Person: { id:number, name:string, profile_path:string|null, known_for:Array<(Movie|Show)>, media_type:"person" }
 */
/**
 * Search across movies, TV shows, and people.
 * @param {string} query - Free text query to search.
 * @param {{ page?: number }} [opts] - Options including page number.
 * @returns {Promise<{ page:number, results:Array<any>, total_results:number, total_pages:number }>} TMDb multi-search response.
 */
export async function searchMulti(query, opts = {}) {
    const { page = 1 } = opts;
    return doFetch("/search/multi", { query, page, include_adult: false });
}

/**
 * Get trending items (movies or TV shows) over a time window.
 * @param {"all"|"movie"|"tv"|"person"} mediaType - Type of media for trending.
 * @param {"day"|"week"} timeWindow - Time window.
 * @returns {Promise<{ page:number, results:Array<(Movie|Show|Person)> }>} Trending response.
 */
/**
 * Get trending items (movies or TV shows) over a time window.
 * @param {"all"|"movie"|"tv"|"person"} [mediaType="all"] - Type of media for trending.
 * @param {"day"|"week"} [timeWindow="day"] - Time window.
 * @param {number} [page=1] - Page number.
 * @returns {Promise<{ page:number, results:Array<any> }>} Trending response.
 */
export async function getTrending(
    mediaType = "all",
    timeWindow = "day",
    page = 1
) {
    return doFetch(
        `/trending/${mediaType}/${timeWindow}`,
        { page },
        { next: { revalidate: 3600 } }
    );
}

/**
 * Get detailed information for a movie.
 * @param {number|string} id - Movie ID.
 * @returns {Promise<Movie>} Movie object including fields like id, title, genres, runtime, poster_path, backdrop_path, overview, release_date.
 */
/**
 * Get detailed information for a movie.
 * @param {number|string} id - Movie ID.
 * @returns {Promise<any>} Movie object including genres, runtime, images, etc.
 */
export async function getMovieDetails(id) {
    return doFetch(`/movie/${id}`, {
        append_to_response: "credits,recommendations,images",
    });
}

/**
 * Get detailed information for a TV show.
 * @param {number|string} id - TV show ID.
 * @returns {Promise<Show>} Show object including id, name, genres, number_of_seasons, poster_path, backdrop_path, overview, first_air_date.
 */
/**
 * Get detailed information for a TV show.
 * @param {number|string} id - TV show ID.
 * @returns {Promise<any>} Show object including genres, seasons, images, etc.
 */
export async function getShowDetails(id) {
    return doFetch(`/tv/${id}`, {
        append_to_response: "aggregate_credits,recommendations,images",
    });
}

/**
 * Get detailed information for a person (cast/crew).
 * @param {number|string} id - Person ID.
 * @returns {Promise<Person>} Person object including id, name, biography, profile_path, combined_credits.
 */
/**
 * Get detailed information for a person (cast/crew).
 * @param {number|string} id - Person ID.
 * @returns {Promise<any>} Person object including combined credits.
 */
export async function getPersonDetails(id) {
    return doFetch(`/person/${id}`, {
        append_to_response: "combined_credits,images",
    });
}

// Genre mappings for human-readable names
const GENRES = {
    movie: {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Science Fiction",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western",
    },
    tv: {
        10759: "Action & Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        10762: "Kids",
        9648: "Mystery",
        10763: "News",
        10764: "Reality",
        10765: "Sci-Fi & Fantasy",
        10766: "Soap",
        10767: "Talk",
        10768: "War & Politics",
        37: "Western",
    },
};

/**
 * Map TMDb genre IDs to readable names for movie or TV.
 * @param {number|number[]} ids - One or more genre IDs.
 * @param {"movie"|"tv"} [type="movie"] - Media type for genre mapping.
 * @returns {string[]} Array of readable genre names.
 */
/**
 * Map TMDb genre IDs to readable names for movie or TV.
 * @param {number|number[]} ids - One or more genre IDs.
 * @param {"movie"|"tv"} [type="movie"] - Media type for genre mapping.
 * @returns {string[]} Array of readable genre names.
 */
export function getByGenre(ids, type = "movie") {
    const table = GENRES[type] || GENRES.movie;
    const list = Array.isArray(ids) ? ids : [ids];
    return list.map((id) => table[id]).filter(Boolean);
}

/**
 * Utility to extract poster path into a full image URL.
 * @param {string|null} path - TMDb poster_path.
 * @param {"w92"|"w154"|"w185"|"w342"|"w500"|"w780"|"original"} size - Image size.
 * @returns {string|null}
 */
/**
 * Build a full TMDb image URL from a poster/backdrop path.
 * @param {string|null} path - TMDb image path (e.g., `/kqjL17yufvn9OVLyXYpvtyrFfak.jpg`).
 * @param {"w92"|"w154"|"w185"|"w342"|"w500"|"w780"|"original"} [size="w500"] - Image size.
 * @returns {string|null} Full image URL or null if no path.
 */
export function getImageUrl(path, size = "w500") {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Validate environment configuration at runtime.
 * Throws if API key is missing.
 */
/**
 * Validate environment configuration at runtime.
 * Throws if the public TMDb API key is missing.
 * @throws {Error} If `NEXT_PUBLIC_TMDB_API_KEY` is not set.
 */
export function assertTmdbConfigured() {
    if (!API_KEY) {
        throw new Error(
            "Missing NEXT_PUBLIC_TMDB_API_KEY environment variable for TMDb."
        );
    }
}

/**
 * Discover movies using TMDb discover endpoint.
 * Pass TMDb query params like with_genres, sort_by, page, year filters.
 * @param {Object} params
 * @returns {Promise<{ page:number, results:Array<Movie>, total_results:number, total_pages:number }>}
 */
/**
 * Discover movies using TMDb discover endpoint.
 * @param {Record<string, string|number|boolean>} [params] - TMDb query params like `with_genres`, `sort_by`, `page`.
 * @returns {Promise<{ page:number, results:Array<any>, total_results:number, total_pages:number }>} Discover response.
 */
export async function discoverMovies(params = {}) {
    return doFetch("/discover/movie", params, { next: { revalidate: 1800 } });
}

/**
 * Get TMDb recommendations for a movie.
 * @param {number|string} id - Movie ID
 * @param {number} page - Page number
 * @returns {Promise<{ page:number, results:Array<Movie> }>}
 */
/**
 * Get TMDb recommendations for a movie.
 * @param {number|string} id - Movie ID.
 * @param {number} [page=1] - Page number.
 * @returns {Promise<{ page:number, results:Array<any> }>} Recommendations response.
 */
export async function getMovieRecommendations(id, page = 1) {
    return doFetch(
        `/movie/${id}/recommendations`,
        { page },
        { next: { revalidate: 1800 } }
    );
}