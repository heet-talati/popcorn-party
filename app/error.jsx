"use client";
export default function Error({ error, reset }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        className="mt-4 inline-flex items-center rounded border px-3 py-2 text-sm"
        onClick={() => reset?.()}
      >
        Try again
      </button>
    </div>
  );
}
