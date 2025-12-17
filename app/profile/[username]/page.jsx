"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import {
  isFollowing,
  toggleFollow,
  getFollowingIds,
  getFollowerIds,
  getUsersByIds,
} from "@/services/relationships";
import ProfileHeader from "@/components/profile/ProfileHeader";
import HistoryItem from "@/components/profile/HistoryItem";
import WatchlistItem from "@/components/profile/WatchlistItem";
import WatchingItem from "@/components/profile/WatchingItem";

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("history");
  const [followBusy, setFollowBusy] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followerUsers, setFollowerUsers] = useState([]);

  useEffect(() => {
    async function run() {
      if (!username) return;
      setLoading(true);
      try {
        // Find user by username
        const usersQ = query(
          collection(db, "users"),
          where("username", "==", username),
          limit(1)
        );
        const usersSnap = await getDocs(usersQ);
        if (usersSnap.empty) {
          setUserDoc(null);
          setActivity([]);
          setLoading(false);
          return;
        }
        const userData = usersSnap.docs[0].data();
        setUserDoc(userData);
        // Fetch activity only if viewer is authenticated (rules restrict reads)
        if (user) {
          const actQ = query(
            collection(db, "user_activity"),
            where("userId", "==", userData.uid),
            orderBy("timestamp", "desc")
          );
          const actSnap = await getDocs(actQ);
          const items = actSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setActivity(items);
        } else {
          setActivity([]);
        }
      } catch (e) {
        console.error(e);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [username, user]);

  // Clear sensitive data when user logs out while viewing the page
  useEffect(() => {
    if (!user) {
      setActivity([]);
      setTab("history");
    }
  }, [user]);

  const isOwner = !!(user && userDoc && user.uid === userDoc.uid);
  const canView = !!user; // any signed-in user can view others' profiles

  // Load follow state when viewing someone else's profile
  useEffect(() => {
    (async () => {
      if (!user || !userDoc || isOwner) return;
      try {
        const f = await isFollowing(user.uid, userDoc.uid);
        setFollowing(f);
      } catch {}
    })();
  }, [user, userDoc, isOwner]);

  // Load this profile's following/followers lists only for authenticated viewers
  useEffect(() => {
    (async () => {
      if (!user || !userDoc?.uid) {
        setFollowingUsers([]);
        setFollowerUsers([]);
        return;
      }
      try {
        const [followingIds, followerIds] = await Promise.all([
          getFollowingIds(userDoc.uid),
          getFollowerIds(userDoc.uid),
        ]);
        const [followingUsersRes, followerUsersRes] = await Promise.all([
          getUsersByIds(followingIds),
          getUsersByIds(followerIds),
        ]);
        setFollowingUsers(followingUsersRes);
        setFollowerUsers(followerUsersRes);
      } catch {
        setFollowingUsers([]);
        setFollowerUsers([]);
      }
    })();
  }, [user, userDoc]);

  const stats = useMemo(() => {
    const watchedMovies = activity.filter(
      (a) => a.mediaType === "movie" && a.status === "watched"
    ).length;
    const watchedShows = activity.filter(
      (a) => a.mediaType === "tv" && a.status === "watched"
    ).length;
    return {
      watchedMovies,
      watchedShows,
      totalWatched: watchedMovies + watchedShows,
    };
  }, [activity]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!userDoc) {
    return <p className="text-muted-foreground">User not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header: responsive username + stats + follow button */}
      <ProfileHeader
        userDoc={userDoc}
        stats={stats}
        isOwner={isOwner}
        user={user}
        following={following}
        followBusy={followBusy}
        onToggleFollow={async () => {
          if (followBusy) return;
          setFollowBusy(true);
          try {
            const now = await toggleFollow(user.uid, userDoc.uid);
            setFollowing(now);
          } finally {
            setFollowBusy(false);
          }
        }}
      />
      {canView ? (
        <>
          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={tab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("history")}
            >
              History
            </Button>
            <Button
              variant={tab === "watching" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("watching")}
            >
              Watching
            </Button>
            <Button
              variant={tab === "watchlist" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("watchlist")}
            >
              Watchlist
            </Button>
          </div>

          {tab === "history" ? (
            <section className="grid md:grid-cols-2 gap-4">
              {activity
                .filter((a) => a.status === "watched")
                .slice(0, 50)
                .map((a) => (
                  <HistoryItem key={a.id} item={a} />
                ))}
              {activity.filter((a) => a.status === "watched").length === 0 && (
                <p className="text-muted-foreground">No watched history yet.</p>
              )}
            </section>
          ) : tab === "watching" ? (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {activity
                .filter((a) => a.status === "watching")
                .slice(0, 100)
                .map((a) => (
                  <WatchingItem key={a.id} item={a} />
                ))}
              {activity.filter((a) => a.status === "watching").length === 0 && (
                <p className="text-muted-foreground">Not watching anything yet.</p>
              )}
            </section>
          ) : (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {activity
                .filter((a) => a.status === "watchlist")
                .slice(0, 100)
                .map((a) => (
                  <WatchlistItem key={a.id} item={a} />
                ))}
              {activity.filter((a) => a.status === "watchlist").length ===
                0 && (
                <p className="text-muted-foreground">Watchlist is empty.</p>
              )}
            </section>
          )}
          {/* Followers / Following */}
          <section className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-medium mb-2">Following</h2>
              {followingUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Not following anyone yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {followingUsers.map((u) => (
                    <li key={u.uid}>
                      <Link
                        href={`/profile/${u.username}`}
                        className="text-sm underline"
                      >
                        {u.username}
                      </Link>
                      {/* <span className="text-sm text-muted-foreground">
                        {" "}
                        · {u.email}
                      </span> */}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2">Followers</h2>
              {followerUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No followers yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {followerUsers.map((u) => (
                    <li key={u.uid}>
                      <Link
                        href={`/profile/${u.username}`}
                        className="text-sm underline"
                      >
                        {u.username}
                      </Link>
                      {/* <span className="text-sm text-muted-foreground">
                        {" "}
                        · {u.email}
                      </span> */}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      ) : (
        <p className="text-muted-foreground">
          Sign in to see this user&apos;s activity.
        </p>
      )}
    </div>
  );
}