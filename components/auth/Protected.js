"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

export default function Protected({ children, redirectTo = "/login" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!user) return null;
  return children;
}
