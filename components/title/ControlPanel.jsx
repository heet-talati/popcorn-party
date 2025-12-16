"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Check, Loader2, XCircle } from "lucide-react";

export default function ControlPanel({
  localStatus,
  setLocalStatus,
  localRating,
  setLocalRating,
  localReview,
  setLocalReview,
  user,
  saving,
  saved,
  saveError,
  onSave,
}) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              aria-label="select-watch-status"
              className="w-full border rounded-md h-9 px-2"
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
            >
              <option aria-label="watchlist" value="watchlist">
                Watchlist
              </option>
              <option aria-label="watching" value="watching">
                Watching
              </option>
              <option aria-label="watched" value="watched">
                Watched
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <label id="rating-label" className="text-sm font-medium">
              Your Rating
            </label>
            <Slider
              value={localRating}
              onValueChange={setLocalRating}
              min={0}
              max={10}
              step={0.5}
              disabled={localStatus !== "watched"}
              aria-labelledby="rating-label"
              aria-label="Your Rating"
              htmlFor="rating-slider"
            />
            <p className="text-xs text-muted-foreground">
              {localStatus === "watched"
                ? localRating[0].toFixed(1)
                : "Select 'Watched' to rate"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Review</label>
          <Input
            value={localReview}
            onChange={(e) => setLocalReview(e.target.value)}
            placeholder={
              localStatus === "watched"
                ? "Optional short review"
                : "Select 'Watched' to add a review"
            }
            disabled={localStatus !== "watched"}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onSave} disabled={!user || saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          {saveError && (
            <span className="flex items-center gap-1 text-red-600 text-sm">
              <XCircle className="h-4 w-4" /> {saveError}
            </span>
          )}
          {!user && (
            <p className="text-xs text-muted-foreground">
              Sign in to save status
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
