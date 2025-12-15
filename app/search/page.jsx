import { Suspense } from "react";
import SearchClient from "./searchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <span>Loading search…</span>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
