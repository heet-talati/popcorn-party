"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	getImageUrl,
	getMovieDetails,
	getShowDetails,
} from "@/services/tmdb";

/**
 * Displays a single watched-history entry for a user.
 * Resolves title metadata from TMDB and falls back gracefully when missing.
 */
export default function HistoryItem({ item }) {
	const [meta, setMeta] = useState(null);

	useEffect(() => {
		let active = true;
		async function load() {
			const tmdbId = item?.tmdbId;
			if (!tmdbId) {
				if (active) setMeta(null);
				return;
			}
			try {
				const fetcher = item?.mediaType === "tv" ? getShowDetails : getMovieDetails;
				const data = await fetcher(tmdbId);
				if (active) setMeta(data || null);
			} catch (error) {
				console.error(`HistoryItem: Failed to fetch ${item?.mediaType} ${tmdbId}:`, error);
				if (active) setMeta(null);
			}
		}
		load();
		return () => {
			active = false;
		};
	}, [item?.mediaType, item?.tmdbId]);

	const title =
		meta?.title ||
		meta?.name ||
		item?.title ||
		item?.name ||
		`#${item?.tmdbId ?? "unknown"}`;
	const date = meta?.release_date || meta?.first_air_date || item?.date;
	const year = date ? new Date(date).getFullYear() : "—";
	const poster = getImageUrl(meta?.poster_path, "w185");
	const mediaLabel =
		item?.mediaType === "tv"
			? "TV"
			: item?.mediaType === "movie"
				? "Movie"
				: "Title";
	const hasRating = typeof item?.rating === "number";

	const linkType =
		item?.mediaType || (meta?.title ? "movie" : meta?.name ? "tv" : "movie");


	return (
		<div className="flex gap-3 rounded-lg border bg-card p-3 shadow-sm">
			<Link
				href={`/title/${item?.tmdbId}?type=${linkType}`}
				className="relative h-28 w-20 overflow-hidden rounded-md bg-muted"
			>
				{poster ? (
					<Image
						src={poster}
						alt={`${title} poster`}
						fill
						sizes="96px"
						priority
						fetchPriority="high"
						loading="eager"
						className="object-cover"
					/>
				) : (
					<div className="h-full w-full bg-muted" aria-hidden="true" />
				)}
			</Link>
			<div className="flex flex-1 flex-col gap-1">
				<div className="flex items-start justify-between gap-2">
					<div className="space-y-1">
						<Link
							href={`/title/${item?.tmdbId}?type=${linkType}`}
							className="font-semibold hover:underline"
						>
							{title}
						</Link>
						<p className="text-sm text-muted-foreground">
							{mediaLabel} • {year}
						</p>
					</div>
					{hasRating && (
						<Badge
							variant="secondary"
							className="inline-flex items-center gap-1 self-start"
						>
							<Star
								className="h-3.5 w-3.5"
								fill="currentColor"
								aria-hidden="true"
							/>
							{item.rating}
						</Badge>
					)}
				</div>
				{item?.review ? (
					<p className="text-sm text-muted-foreground line-clamp-3">
						{item.review}
					</p>
				) : null}
			</div>
		</div>
	);
}
