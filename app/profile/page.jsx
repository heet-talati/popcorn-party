"use client";
import Protected from "@/components/auth/Protected";

export default function ProfilePage() {
  return (
    <Protected>
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Your Profile</h1>
        <p className="text-muted-foreground">
          Profile details will appear here.
        </p>
      </section>
    </Protected>
  );
}