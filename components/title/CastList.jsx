"use client";
import Image from "next/image";
import { getImageUrl } from "@/services/tmdb";

export default function CastList({ data }) {
    const cast =
        (data && (data.credits?.cast || data.aggregate_credits?.cast)) || [];
    if (!cast || cast.length === 0) {
        return <div className="text-sm text-muted-foreground">No cast info.</div>;
    }

    const list = cast.slice(0, 8);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {list.map((person) => (
                    <div key={person.id} className="flex gap-2 items-center">
                        <div className="relative h-12 w-8 overflow-hidden rounded-md bg-muted">
                            {person.profile_path ? (
                                <Image
                                    src={getImageUrl(person.profile_path, "w185")}
                                    alt={person.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-400" />
                            )}
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">{person.name}</div>
                            <div className="text-muted-foreground">{person.character || person.roles?.[0]?.character || ""}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

