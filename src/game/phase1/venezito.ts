import type { LoadedImageSource } from "../imageSource";

export type VenezitoMood = "neutral" | "happy" | "sad";
export type Phase1VenezitoSurface = "face" | "full";

export type Phase1VenezitoImageSet = {
  face: Record<VenezitoMood, LoadedImageSource | null>;
  full: Record<VenezitoMood, LoadedImageSource | null>;
};

export function resolvePhase1VenezitoImage(
  images: Phase1VenezitoImageSet | null,
  surface: Phase1VenezitoSurface,
  mood: VenezitoMood,
) {
  return images?.[surface][mood] ?? null;
}
