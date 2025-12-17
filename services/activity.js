// Firestore helpers for user media activity tracking
// Collection: user_activity
// Document ID convention: `${userId}_${tmdbId}` for easy lookup

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

/**
 * Update or create a user's media status record.
 * @param {Object} params
 * @param {string} params.userId - Firebase Auth UID
 * @param {number|string} params.tmdbId - TMDb media id
 * @param {"movie"|"tv"} params.mediaType - Media type
 * @param {"watched"|"watching"|"watchlist"} params.status - Activity status
 * @param {number} [params.rating] - 0-10
 * @param {string} [params.review] - optional text
 * @returns {Promise<void>}
 */
export async function updateMediaStatus({
    userId,
    tmdbId,
    mediaType,
    status,
    rating = null,
    review = "",
}) {
    if (!userId) throw new Error("updateMediaStatus: userId is required");
    if (!tmdbId) throw new Error("updateMediaStatus: tmdbId is required");
    if (!mediaType) throw new Error("updateMediaStatus: mediaType is required");
    if (!status) throw new Error("updateMediaStatus: status is required");

    const id = `${userId}_${tmdbId}`;
    const ref = doc(db, "user_activity", id);
    const ratingNum = Number(rating);
    const finalRating =
        Number.isFinite(ratingNum) && ratingNum >= 0 && ratingNum <= 10
            ? ratingNum
            : null;
    const safeReview = String(review || "")
        .trim()
        .slice(0, 500);

    const payload = {
        userId,
        tmdbId: typeof tmdbId === "string" ? tmdbId : Number(tmdbId),
        mediaType,
        status,
        rating: finalRating,
        review: safeReview,
        timestamp: serverTimestamp(),
    };
    await setDoc(ref, payload, { merge: true });
}

/**
 * Get the media status for a user and tmdbId (one-shot).
 * @param {string} userId
 * @param {number|string} tmdbId
 * @returns {Promise<null|{userId:string, tmdbId:number, mediaType:string, status:string, rating:number|null, review:string, timestamp:import("firebase/firestore").Timestamp}>}
 */
export async function getUserMediaStatus(userId, tmdbId) {
    if (!userId || !tmdbId) return null;
    const id = `${userId}_${tmdbId}`;
    const ref = doc(db, "user_activity", id);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

/**
 * Remove a media title from the user's account.
 * @param {string} userId - Firebase Auth UID
 * @param {number|string} tmdbId - TMDb media id
 * @returns {Promise<void>}
 */
export async function removeMediaStatus(userId, tmdbId) {
    if (!userId) throw new Error("removeMediaStatus: userId is required");
    if (!tmdbId) throw new Error("removeMediaStatus: tmdbId is required");

    const id = `${userId}_${tmdbId}`;
    const ref = doc(db, "user_activity", id);
    await deleteDoc(ref);
}
