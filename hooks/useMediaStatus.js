"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * Hook to subscribe to a user's media status for a given TMDb id.
 * @param {number|string} tmdbId
 * @returns {{ status: null|{userId:string, tmdbId:number, mediaType:string, status:string, rating:number|null, review:string}, loading: boolean }}
 */
export default function useMediaStatus(tmdbId) {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !tmdbId) {
      setStatus(null);
      setLoading(false);
      return;
    }
    const id = `${user.uid}_${tmdbId}`;
    const ref = doc(db, "user_activity", id);
    const unsub = onSnapshot(ref, (snap) => {
      setStatus(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
    return () => unsub();
  }, [user, tmdbId]);

  return { status, loading };
}
