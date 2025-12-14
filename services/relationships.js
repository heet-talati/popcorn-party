// Firestore helpers for social follow relationships
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    setDoc,
    deleteDoc,
} from "firebase/firestore";

const REL_COLLECTION = "relationships";

/**
 * Follow a user.
 * @param {string} followerId
 * @param {string} followingId
 */
export async function followUser(followerId, followingId) {
    if (!followerId || !followingId) throw new Error("followUser: ids required");
    if (followerId === followingId)
        throw new Error("followUser: cannot follow yourself");
    const id = `${followerId}_${followingId}`;
    await setDoc(doc(db, REL_COLLECTION, id), { followerId, followingId });
}

/**
 * Unfollow a user.
 * @param {string} followerId
 * @param {string} followingId
 */
export async function unfollowUser(followerId, followingId) {
    if (!followerId || !followingId)
        throw new Error("unfollowUser: ids required");
    const id = `${followerId}_${followingId}`;
    try {
        await deleteDoc(doc(db, REL_COLLECTION, id));
    } catch (err) {
        // Surface a clearer error to the UI while keeping original context
        const msg = (err && err.message) || "Unfollow failed";
        throw new Error(`unfollowUser: ${msg}`);
    }
}

/**
 * Get list of following user IDs for a follower.
 * @param {string} followerId
 * @returns {Promise<string[]>}
 */
export async function getFollowingIds(followerId) {
    const q = query(
        collection(db, REL_COLLECTION),
        where("followerId", "==", followerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().followingId);
}

/**
 * Get list of follower user IDs for a given user (who follows this user)
 * @param {string} followingId
 * @returns {Promise<string[]>}
 */
export async function getFollowerIds(followingId) {
    const q = query(
        collection(db, REL_COLLECTION),
        where("followingId", "==", followingId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().followerId);
}

/**
 * Fetch basic user docs for a list of UIDs
 * @param {string[]} uids
 * @returns {Promise<Array<{uid:string, username?:string, email?:string}>>}
 */
export async function getUsersByIds(uids) {
    const results = [];
    await Promise.all(
        (uids || []).map(async (uid) => {
            try {
                const ref = doc(db, "users", uid);
                const snap = await getDoc(ref);
                if (snap.exists()) results.push(snap.data());
            } catch {
                // ignore per-user error
            }
        })
    );
    return results;
}

/**
 * Find users by username (exact or startsWith)
 * @param {string} username
 * @returns {Promise<Array<{uid:string, email:string, username:string}>>}
 */
export async function findUsersByUsername(username) {
    if (!username) return [];
    const users = collection(db, "users");
    // Prefix search: username >= term and username <= term + \uf8ff
    const lower = username;
    const upper = `${username}\uf8ff`;
    const q = query(
        users,
        where("username", ">=", lower),
        where("username", "<=", upper)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

/**
 * Check if follower currently follows followingId
 */
export async function isFollowing(followerId, followingId) {
    if (!followerId || !followingId) return false;
    const id = `${followerId}_${followingId}`;
    const ref = doc(db, REL_COLLECTION, id);
    const snap = await getDoc(ref);
    return snap.exists();
}

/**
 * Toggle follow state. Returns new state: true if now following.
 */
export async function toggleFollow(followerId, followingId) {
    const nowFollowing = await isFollowing(followerId, followingId);
    if (nowFollowing) {
        try {
            await unfollowUser(followerId, followingId);
            return false;
        } catch (err) {
            // If permission denied, keep current state and rethrow for UI to handle
            throw err;
        }
    }
    await followUser(followerId, followingId);
    return true;
}