import pointsSource from "../../../points.txt?raw";

import type { Point } from "../retro/types";

const GREASE_POINT_PATTERN = /x:\s*(-?\d+)\s*,\s*y:\s*(-?\d+)/g;

export const GREASE_POINTS: Point[] = Array.from(
  pointsSource.matchAll(GREASE_POINT_PATTERN),
  ([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }),
);

export const GREASE_FRAME_DURATION_MS = 130;
export const GREASE_FRAMES_PER_POINT = 4;
export const GREASE_WOBBLE_ROTATIONS = [-0.12, 0.08, -0.05, 0.04];
export const GREASE_WOBBLE_Y_OFFSETS = [0, -4, 2, -2];
export const GREASE_SPRITE_HEIGHT = 118;

export function getGreaseAnimationTotalDuration() {
  return GREASE_POINTS.length * GREASE_FRAMES_PER_POINT * GREASE_FRAME_DURATION_MS;
}

export function getGreaseAnimationPose(elapsed: number) {
  if (GREASE_POINTS.length === 0) {
    return null;
  }

  const maxFrameIndex = GREASE_POINTS.length * GREASE_FRAMES_PER_POINT - 1;
  const frameIndex = Math.min(
    maxFrameIndex,
    Math.floor(elapsed / GREASE_FRAME_DURATION_MS),
  );
  const pointIndex = Math.floor(frameIndex / GREASE_FRAMES_PER_POINT);
  const wobbleIndex = frameIndex % GREASE_FRAMES_PER_POINT;

  return {
    point: GREASE_POINTS[pointIndex],
    rotation: GREASE_WOBBLE_ROTATIONS[wobbleIndex] ?? 0,
    offsetY: GREASE_WOBBLE_Y_OFFSETS[wobbleIndex] ?? 0,
  };
}
