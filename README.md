# PopcornParty

Track what you watch, discover new favorites, and share your taste with friends. PopcornParty is a Next.js app that blends TMDb-powered discovery with Firebase authentication, activity tracking, and simple social features.

> This product uses the TMDb API but is not endorsed or certified by TMDb.

## Features
- Search: Fast search with filters for genre, year range, and minimum rating.
- Title details: Rich movie/TV pages with cast, info, your rating and review.
- Watch status: Mark items as Watchlist, Watching, or Watched.
- Recommendations: "For you" and "Because you watched" sections powered by your history.
- Activity feed: See what the friends you follow are watching and rating.
- Social: Find users by username, follow/unfollow, and view public profiles.
# PopcornParty 🍿

Track what you watch, discover new favorites, and share your taste with friends. PopcornParty is a modern Next.js app powered by TMDb and Firebase.

> This product uses the TMDb API but is not endorsed or certified by TMDb.

## Features ✨
- 🔎 Search: Fast search with filters for genre, year range, and minimum rating.
- 🎬 Title details: Rich movie/TV pages with cast, info, your rating, and review.
- ✅ Watch status: Mark items as Watchlist, Watching, or Watched.
- 🤖 Recommendations: "For you" and "Because you watched" based on history.
- 📰 Activity feed: See what friends are watching and rating.
- 👥 Social: Find users by username, follow/unfollow, view public profiles.
- 🌗 Theming: Light/Dark theme with persistence.

## Tech Stack ⚙️
- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 + shadcn/ui
- Firebase (Auth + Firestore)
- TMDb API (v3)

## Quickstart 🚀

### 1️⃣ Prerequisites
- Node.js 18.18+ (or 20+) and npm
- A Firebase project (Authentication + Firestore enabled)
- A TMDb API v3 key

### 2️⃣ Install
```powershell
# From a PowerShell terminal
npm install
```

### 3️⃣ Configure environment
Create a file named `.env.local` in the project root and add your keys (client-side only values used by the app):

```
# TMDb
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_v3_api_key

# Firebase (from Firebase console → Project settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4️⃣ Firebase setup (high level)
- 🔐 Enable Email/Password under Authentication → Sign-in method
- 🗄️ Create a Firestore database (start in test for local dev)
- 👤 Create a user from the Auth console or use the app’s Sign Up page

Collections (auto-created on first write):
- `users` — basic profile per user (email, username)
- `user_activity` — one doc per user+title (`${userId}_${tmdbId}`) storing status, rating, review
- `relationships` — follow edges (`${followerId}_${followingId}`)

### 5️⃣ Run in development
```powershell
npm run dev
```
Open http://localhost:3000

### 6️⃣ Build and run production
```powershell
npm run build
npm start
```

## Project Structure 🗂️
```
app/
  layout.js          # Root layout with AuthProvider + GlobalLayout
  page.js            # Home: feed, recommendations, friend search
  login/             # Login page
  signup/            # Signup page
  profile/           # Private profile (placeholder)
    [username]/      # Public profile page
  search/            # Search UI (client) wrapped in Suspense
    searchClient.jsx
  title/[id]/        # Title detail page
components/          # UI and app components (auth, layout, media card, ui/*)
hooks/               # useActivityFeed, useMediaStatus, useRecommendations
services/            # TMDb API, activity, relationships, recommendations
lib/                 # Firebase client initialization
public/              # Static assets
```

## Available Scripts 📜
- `npm run dev`: Start Next.js in development
- `npm run build`: Create an optimized production build
- `npm start`: Start the production server
- `npm run lint`: Run ESLint

## How It Works 🧠
- TMDb: API calls live in `services/tmdb.js` and require `NEXT_PUBLIC_TMDB_API_KEY`.
- Firebase: `lib/firebase.js` initializes Auth/Firestore from `NEXT_PUBLIC_FIREBASE_*` values.
- Activity: `services/activity.js` writes status/rating/review; `hooks/useMediaStatus` reads it live.
- Social: `services/relationships.js` manages follows; `hooks/useActivityFeed` builds the feed.
- Recommendations: `services/recommendations.js` derives interests (top genres/movies) and queries TMDb.

## Troubleshooting 🧰
- useSearchParams Suspense warning on build:
  - The `/search` page renders a client component within a `Suspense` boundary (required by Next.js).
- Missing TMDb key:
  - Ensure `NEXT_PUBLIC_TMDB_API_KEY` is set in `.env.local`, then restart dev server.
- Firebase permission/reads failing:
  - Confirm you’re signed in and Firestore rules permit reads/writes for the used collections.
- 401/403 from TMDb:
  - Double-check your v3 key and quota.

## TMDb Attribution 🎞️
This product uses the TMDb API but is not endorsed or certified by TMDb. See https://www.themoviedb.org/terms-of-use

## License 📄
Educational project: no explicit license provided. Add one if you plan to distribute.
