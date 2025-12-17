"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/components/auth/Protected";
import { useAuth } from "@/components/auth/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile?.username) {
      // Redirect to the user's public profile page
      router.replace(`/profile/${profile.username}`);
    }
  }, [loading, user, profile?.username, router]);

  return (
    <Protected>
      <section className="space-y-6">
        {loading ? (
          <>
            <Skeleton className="h-8 w-40" />
            <div className="grid sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </>
        ) : !profile?.username ? (
          <>
            <h1 className="text-2xl font-semibold">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Please set up your username to view your profile.
            </p>
          </>
        ) : (
          <>
            <Skeleton className="h-8 w-40" />
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </>
        )}
      </section>
    </Protected>
  );
}