"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMovieDetails, getShowDetails, getImageUrl } from "@/services/tmdb";
import { Check, Loader2, Star, XCircle } from "lucide-react";
import PosterQuickInfo from "@/components/title/PosterQuickInfo";
import ControlPanel from "@/components/title/ControlPanel";
import CastList from "@/components/title/CastList";
import useMediaStatus from "@/hooks/useMediaStatus";
import { updateMediaStatus } from "@/services/activity";
import { useAuth } from "@/components/auth/AuthContext";

export default function TitleDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [data, setData] = useState(null);
    const [mediaType, setMediaType] = useState("movie");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user } = useAuth();
    const { status } = useMediaStatus(id);
    const [localStatus, setLocalStatus] = useState("watchlist");
    const [localRating, setLocalRating] = useState([5]);
    const [localReview, setLocalReview] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        async function run() {
            setLoading(true);
            setError("");
            try {
                // Try movie first; if it fails, try tv
                let d = await getMovieDetails(id);
                setMediaType("movie");
                setData(d);
            } catch {
                try {
                    let d2 = await getShowDetails(id);
                    setMediaType("tv");
                    setData(d2);
                } catch (e) {
                    setError("Unable to fetch details.");
                    setData(null);
                }
            } finally {
                setLoading(false);
            }
        }
        if (id) run();
    }, [id]);

    useEffect(() => {
        if (status) {
            setLocalStatus(status.status || "watchlist");
            setLocalRating([typeof status.rating === "number" ? status.rating : 5]);
            setLocalReview(status.review || "");
        }
    }, [status]);

    const title = useMemo(() => data?.title || data?.name || "", [data]);
    const backdrop = useMemo(
        () => getImageUrl(data?.backdrop_path, "w780"),
        [data]
    );
    const poster = useMemo(() => getImageUrl(data?.poster_path, "w342"), [data]);
    const year = useMemo(() => {
        const date = data?.release_date || data?.first_air_date || "";
        return date ? new Date(date).getFullYear() : "—";
    }, [data]);
    const vote = useMemo(
        () =>
            typeof data?.vote_average === "number"
                ? data.vote_average.toFixed(1)
                : "N/A",
        [data]
    );

    async function saveStatus() {
        if (!user) return;
        const ratingNum = Number(localRating[0]);
        // Only allow rating when marked as 'watched'
        const safeRating =
            localStatus === "watched" && Number.isFinite(ratingNum)
                ? Math.min(10, Math.max(0, ratingNum))
                : null;
        const safeReview = (localReview || "").trim();
        if (safeReview.length > 500) {
            setSaveError("Review must be 500 characters or fewer.");
            return;
        }
        setSaving(true);
        setSaveError("");
        try {
            await updateMediaStatus({
                userId: user.uid,
                tmdbId: id,
                mediaType,
                status: localStatus,
                rating: safeRating,
                review: safeReview,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            setSaveError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <div className="grid md:grid-cols-[220px_1fr] gap-6">
                    <Skeleton className="h-64 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return <p className="text-muted-foreground">{error || "Not found."}</p>;
    }

    return (
        <div className="space-y-6">
            {/* Hero */}
            {backdrop && (
                <div className="relative hidden sm:block sm:h-72 md:h-96 w-full overflow-hidden rounded-md">
                    <Image
                        src={backdrop}
                        alt={`${title} backdrop`}
                        fill
                        sizes="100vw"
                        loading="eager"
                        priority
                        fetchPriority="high"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="grid md:grid-cols-[220px_1fr] gap-6">
                {/* Poster and quick info */}
                <PosterQuickInfo
                    poster={poster}
                    title={title}
                    vote={vote}
                    year={year}
                />

                {/* Content */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-semibold">{title}</h1>
                        <p className="mt-2 text-muted-foreground">
                            {data.overview || "No plot available."}
                        </p>
                    </div>

                    {/* Control panel */}
                    <ControlPanel
                        localStatus={localStatus}
                        setLocalStatus={setLocalStatus}
                        localRating={localRating}
                        setLocalRating={setLocalRating}
                        localReview={localReview}
                        setLocalReview={setLocalReview}
                        user={user}
                        saving={saving}
                        saved={saved}
                        saveError={saveError}
                        onSave={saveStatus}
                    />

                    {/* Cast & Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <CastList data={data} />

                        <Card>
                            <CardContent className="pt-4 space-y-2">
                                <h2 className="text-xl font-semibold">Info</h2>
                                <p className="text-sm">
                                    Genres: {" "}
                                    {(data.genres || []).map((g) => g.name).join(", ") || "—"}
                                </p>
                                {mediaType === "movie" ? (
                                    <p className="text-sm">
                                        Runtime: {data.runtime ? `${data.runtime} min` : "—"}
                                    </p>
                                ) : (
                                    <p className="text-sm">
                                        Seasons: {data.number_of_seasons ?? "—"} • Episodes: {" "}
                                        {data.number_of_episodes ?? "—"}
                                    </p>
                                )}
                                <p className="text-sm">TMDb ID: {id}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
