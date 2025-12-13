"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFollowingIds } from "@/services/relationships";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";

/**
 * Hook to load recent activities from users the current user follows.
 * Returns up to 20 latest items.
 */
export default function useActivityFeed() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const following = await getFollowingIds(user.uid);
        if (following.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        // Fetch activities for all following users; simple approach without composite OR query
        // We query per user and merge results, then sort by timestamp desc.
        const promises = following.map(async (uid) => {
          const q = query(
            collection(db, "user_activity"),
            where("userId", "==", uid),
            orderBy("timestamp", "desc"),
            limit(20)
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        });
        const results = (await Promise.all(promises)).flat();
        // Enrich with usernames for display
        const userIds = Array.from(
          new Set(results.map((r) => r.userId).filter(Boolean))
        );
        const nameMap = new Map();
        await Promise.all(
          userIds.map(async (uid) => {
            try {
              const uref = doc(db, "users", uid);
              const usnap = await getDoc(uref);
              if (usnap.exists()) {
                const u = usnap.data();
                nameMap.set(uid, u.username || u.email || uid);
              }
            } catch {
              // ignore
            }
          })
        );
        const enriched = results.map((r) => ({
          ...r,
          userName: nameMap.get(r.userId) || r.userId,
        }));
        enriched.sort(
          (a, b) =>
            (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0)
        );
        setItems(enriched.slice(0, 20));
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [user]);

  return { items, loading };
}
