"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isFollowing, toggleFollow } from "@/services/relationships";

/**
 * FriendRow
 * Row showing a user's follow state with actions to follow/unfollow.
 * Props:
 *  - me: current user id/object used for relationship checks
 *  - user: the user being displayed (expects `uid` and `username`)
 *  - onToggle: optional callback invoked with the target user's uid after follow change
 * Behavior:
 *  - Loads whether `me` is following `user.uid` on mount and updates UI.
 *  - `click` toggles follow state and prevents duplicate requests via `busy`.
 */
export default function FriendRow({ me, user, onToggle }) {
  // Prevent double-clicks while a follow request is in-flight
  const [busy, setBusy] = useState(false);
  // Local cached follow state
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    // `active` avoids setting state after unmount
    let active = true;
    (async () => {
      try {
        const is = await isFollowing(me, user.uid);
        if (active) setFollowing(is);
      } catch { }
    })();
    return () => {
      active = false;
    };
  }, [me, user.uid]);
  async function click() {
    if (busy) return; // ignore while processing
    setBusy(true);
    try {
      // toggleFollow returns the new follow state
      const now = await toggleFollow(me, user.uid);
      setFollowing(now);
      // notify parent if provided
      onToggle?.(user.uid);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm">
        <span className="font-medium">{user.username}</span>
      </div>
      <Button
        size="sm"
        variant={following ? "secondary" : "default"}
        onClick={click}
        disabled={busy}
      >
        {following ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}
