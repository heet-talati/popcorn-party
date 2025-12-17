"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import FeedItem from "@/components/home/FeedItem";
import FriendRow from "@/components/home/FriendRow";
import { toggleFollow } from "@/services/relationships";
import { findUsersByUsername } from "@/services/relationships";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useActivityFeed from "@/hooks/useActivityFeed";
import useRecommendations from "@/hooks/useRecommendations";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { items, loading } = useActivityFeed();
  const rec = useRecommendations();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [searching, setSearching] = useState(false);

  async function doSearch(term) {
    if (!user) return;
    const termTrimmed = term.trim();

    if (!termTrimmed) {
      setFriends([]);
      return;
    }

    setSearching(true);

    try {
      const res = await findUsersByUsername(termTrimmed);
      const exact = res.filter(
        (foundUser) => foundUser.uid !== user.uid && (foundUser.username || "").toLowerCase() === termTrimmed.toLowerCase()
      );
      setFriends(exact.slice(0, 10));
    }
    finally {
      setSearching(false);
    }
  }

  async function onToggleFollow(targetUid) {
    if (!user) return;
    await toggleFollow(user.uid, targetUid);
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to PopcornParty</h1>
      <p className="text-muted-foreground">
        Track movies you watch, discover new favorites, and keep them organized.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Button onClick={() => router.push("/search")}>Add Movie</Button>
          </CardContent>
        </Card>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  doSearch(e.target.value);
                }}
                placeholder="Search by username..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
              {searching ? (
                <p className="text-sm text-muted-foreground">Searching…</p>
              ) : friends.length === 0 && query ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <FriendRow
                      key={friend.uid}
                      me={user.uid}
                      user={friend}
                      onToggle={onToggleFollow}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading feed...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity. Follow friends to see updates.
              </p>
            ) : (
              items.slice(0, 10).map((activity) => <FeedItem key={activity.id} item={activity} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Based on your interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rec.loading ? (
              <p className="text-sm text-muted-foreground">
                Loading recommendations...
              </p>
            ) : rec.interestBased.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recommendations yet. Rate a few movies to personalize.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {rec.interestBased.slice(0, 6).map((movie) => (
                  <Link key={movie.id} href={`/title/${movie.id}?type=movie`} className="block">
                    <div className="text-sm">
                      <span className="font-medium">{movie.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>
              {rec.topMovie
                ? `Because you watched ${rec.topMovie.title}`
                : "Because you watched"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rec.loading ? (
              <p className="text-sm text-muted-foreground">
                Loading recommendations...
              </p>
            ) : rec.becauseYouWatched.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No similar picks yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rec.becauseYouWatched.slice(0, 6).map((movie) => (
                  <Link key={movie.id} href={`/title/${movie.id}?type=movie`} className="block">
                    <div className="text-sm">
                      <span className="font-medium">{movie.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}