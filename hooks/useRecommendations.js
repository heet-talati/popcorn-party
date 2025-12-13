"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const DEBOUNCE_MS = 400;

/**
 * Hook to compute and provide personalized "For You" recommendations.
 * Recomputes when the user's activity changes.
 *
 * @returns {{
 *   loading: boolean,
 *   interestBased: any[],
 *   becauseYouWatched: any[],
 *   topMovie: any,
 *   topGenres: any[]
 * }}
 */

export default function useRecommendations() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: false,
    interestBased: [],
    becauseYouWatched: [],
    topMovie: null,
    topGenres: [],
  });

  // Refrences to manage cleanup and cancellation
  const unsubscribeRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  /**
   * Fetches recommendations from the service.
   */
  const fetchRecommendations = async (userId) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Dynamically import the recommendations service
      const { getForYouRecommendations } = await import(
        "@/services/recommendations"
      );

      // Call the recommendation service
      const result = await getForYouRecommendations(userId);

      // Update state with results
      setState({
        loading: false,
        interestBased: result?.interestBased || [],
        becauseYouWatched: result?.becauseYouWatched || [],
        topMovie: result?.topMovie || null,
        topGenres: result?.topGenres || [],
      });
    } catch (error) {
      // Catch errors and return empty arrays
      console.error("Error fetching recommendations:", error);
      setState({
        loading: false,
        interestBased: [],
        becauseYouWatched: [],
        topMovie: null,
        topGenres: [],
      });
    }
  };

  /**
   * Schedules a debounced recompute of recommendations.
   */
  const scheduleRecompute = (userId) => {
    // Clear any pending debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Schedule a new recompute after the debounce delay
    debounceTimeoutRef.current = setTimeout(() => {
      fetchRecommendations(userId);
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    // If no user, return empty recommendations
    if (!user?.uid) {
      setState({
        loading: false,
        interestBased: [],
        becauseYouWatched: [],
        topMovie: null,
        topGenres: [],
      });
      return;
    }

    // Initial fetch on mount or when user.uid changes
    fetchRecommendations(user.uid);

    // Subscribe to user_activity changes for the current user
    const activityQuery = query(
      collection(db, "user_activity"),
      where("userId", "==", user.uid)
    );

    unsubscribeRef.current = onSnapshot(activityQuery, () => {
      // On any activity change, debounce a recompute
      scheduleRecompute(user.uid);
    });

    // Cleanup function
    return () => {
      // Cancel in-flight computations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Unsubscribe from Firestore listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.uid]);

  return state;
}
