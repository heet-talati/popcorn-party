"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser || null);
      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile({ uid: fbUser.uid, ...snap.data() });
        } else {
          setProfile({ uid: fbUser.uid, email: fbUser.email ?? null });
        }
      } catch (e) {
        setProfile({ uid: fbUser.uid, email: fbUser.email ?? null });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) {
        setProfile(null);
        return;
      }
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : null;
        setProfile(data);
      } catch {
        setProfile(null);
      }
    }
    loadProfile();
  }, [user?.uid]);

  const value = useMemo(
    () => ({ user, profile, loading, signOut: () => fbSignOut(auth) }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
